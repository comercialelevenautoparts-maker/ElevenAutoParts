const axios = require('axios');
const supabase = require('../config/supabase');

const BLING_API_URL = 'https://www.bling.com.br/Api/v3';
const BLING_AUTH_URL = 'https://www.bling.com.br/Api/v3/oauth/authorize';
const BLING_TOKEN_URL = 'https://www.bling.com.br/Api/v3/oauth/token';

class BlingService {
    constructor() {
        this.clientId = process.env.BLING_CLIENT_ID;
        this.clientSecret = process.env.BLING_CLIENT_SECRET;
        this.redirectUri = process.env.BLING_CALLBACK_URL;
    }

    getAuthorizationUrl() {
        const state = Math.random().toString(36).substring(7);
        const scope = 'vendas:write vendas:read produtos:read contatos:read notas_fiscais:write';
        const url = `${BLING_AUTH_URL}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scope}&state=${state}`;
        console.log('Generated Bling Auth URL:', url);
        return url;
    }

    async exchangeCodeForToken(code) {
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        try {
            const response = await axios.post(BLING_TOKEN_URL, new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.redirectUri
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                }
            });

            const { access_token, refresh_token, expires_in } = response.data;
            await this.saveCredentials(access_token, refresh_token, expires_in);
            return response.data;
        } catch (error) {
            console.error('Error exchanging code for token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Bling');
        }
    }

    async saveCredentials(accessToken, refreshToken, expiresIn) {
        try {
            const { data, error } = await supabase
                .from('integrations')
                .upsert({
                    service: 'bling',
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'service' });

            if (error) throw error;
            console.log('Bling credentials saved to Supabase.');
        } catch (error) {
            console.error('Error saving credentials to Supabase:', error.message);
            throw error;
        }
    }

    async getAccessToken() {
        try {
            const { data: integration, error } = await supabase
                .from('integrations')
                .select('*')
                .eq('service', 'bling')
                .single();

            if (error || !integration) {
                throw new Error('Bling integration not found. Please authenticate first.');
            }

            const lastUpdate = new Date(integration.updated_at);
            const expireTime = new Date(lastUpdate.getTime() + integration.expires_in * 1000);
            const now = new Date();

            if (now >= new Date(expireTime.getTime() - 5 * 60000)) {
                console.log('Token expired or expiring soon, refreshing...');
                return await this.refreshToken(integration.refresh_token);
            }

            return integration.access_token;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            throw error;
        }
    }

    async refreshToken(currentRefreshToken) {
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        try {
            const response = await axios.post(BLING_TOKEN_URL, new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: currentRefreshToken
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                }
            });

            const { access_token, refresh_token, expires_in } = response.data;
            await this.saveCredentials(access_token, refresh_token, expires_in);
            return access_token;

        } catch (error) {
            console.error('Error refreshing token:', error.response?.data || error.message);
            throw new Error('Failed to refresh Bling token');
        }
    }

    async createSalesOrder(orderId) {
        try {
            console.log(`📡 Iniciando processamento de pedido de venda no Bling para o Pedido ID: ${orderId}`);
            const token = await this.getAccessToken();

            // 1. Buscar detalhes do pedido
            const { data: order, error: orderError } = await supabase
                .from('pedidos')
                .select('*')
                .eq('id', orderId)
                .single();

            if (orderError || !order) {
                console.error('Order Fetch Error Detail:', orderError);
                throw new Error(`Pedido ${orderId} não encontrado no banco de dados.`);
            }

            // 1.1 Buscar itens do pedido
            const { data: items, error: itemsError } = await supabase
                .from('pedido_itens')
                .select('*, product:produtos (*)')
                .eq('pedido_id', orderId);

            if (itemsError) {
                console.error('Items Fetch Error:', itemsError);
                // Fallback: tentar sem o join do produto se o join falhar
                const { data: simpleItems, error: simpleItemsError } = await supabase
                    .from('pedido_itens')
                    .select('*')
                    .eq('pedido_id', orderId);

                if (simpleItemsError) throw simpleItemsError;
                order.items = simpleItems;
            } else {
                order.items = items;
            }

            // 2. Buscar dados do cliente (profile + endereço)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', order.user_id)
                .single();

            const { data: address, error: addressError } = await supabase
                .from('enderecos')
                .select('*')
                .eq('id', order.endereco_id)
                .maybeSingle();

            if (profileError || !profile) {
                throw new Error(`Perfil do utilizador ${order.user_id} não encontrado.`);
            }

            // 3. Buscar ou Vincular contato no Bling
            console.log('🔍 Buscando contato no Bling por CPF...');
            let blingContactId = null;
            const cpfLimpo = (profile.cpf || '').replace(/\D/g, '');

            if (cpfLimpo) {
                try {
                    const contactRes = await axios.get(`${BLING_API_URL}/contatos`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { documento: cpfLimpo }
                    });
                    if (contactRes.data?.data?.length > 0) {
                        blingContactId = contactRes.data.data[0].id;
                        console.log(`   ✅ Contato encontrado: ${blingContactId}`);
                    }
                } catch (err) {
                    console.log('   ⚠️ Contato não encontrado ou erro na busca.');
                }
            }

            // 4. Montar o JSON para o Bling V3
            const blingOrder = {
                data: new Date(order.created_at).toISOString().split('T')[0],
                numero: order.numero_pedido || undefined,
                contato: {
                    id: blingContactId || undefined,
                    nome: profile.nome || profile.email,
                    numeroDocumento: cpfLimpo,
                    tipoPessoa: cpfLimpo.length > 11 ? 'J' : 'F'
                },
                itens: order.items.map(item => ({
                    codigo: item.product?.sku || `PROD-${item.produto_id}`,
                    descricao: item.product?.nome || 'Produto Sem Nome',
                    quantidade: item.quantidade,
                    valor: Number(item.preco_unitario),
                    unidade: 'un'
                })),
                transporte: {
                    frete: Number(order.valor_frete || 0)
                },
                finalizacao: {
                    valorDesconto: Number(order.valor_desconto || 0)
                }
            };

            if (address) {
                blingOrder.transporte.enderecoEntrega = {
                    endereco: address.logradouro,
                    numero: address.numero,
                    complemento: address.complemento,
                    bairro: address.bairro,
                    cidade: address.cidade,
                    uf: address.uf,
                    cep: (address.cep || '').replace(/\D/g, '')
                };
            }

            console.log('📦 Enviando pedido para o Bling...');

            const response = await axios.post(`${BLING_API_URL}/pedidos/vendas`, blingOrder, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const blingOrderId = response.data?.data?.id;

            await supabase
                .from('pedidos')
                .update({
                    nfe_status: 'pedido_criado',
                    nfe_key: blingOrderId ? String(blingOrderId) : null
                })
                .eq('id', orderId);

            console.log(`✅ Pedido de venda criado com sucesso no Bling! ID: ${blingOrderId}`);

            return {
                success: true,
                blingOrderId: blingOrderId,
                message: 'Pedido de venda criado com sucesso no Bling.'
            };

        } catch (error) {
            console.error('❌ Erro ao criar pedido de venda no Bling:', error.response?.data || error.message);

            await supabase
                .from('pedidos')
                .update({ nfe_status: 'erro_integracao' })
                .eq('id', orderId);

            throw error;
        }
    }

    async emitirNFe(blingOrderId) {
        try {
            console.log(`📡 Solicitando emissão de NF-e para o Pedido Bling: ${blingOrderId}`);
            const token = await this.getAccessToken();

            // Endpoint V3 para gerar NF-e a partir de um pedido de venda
            const response = await axios.post(`${BLING_API_URL}/pedidos/vendas/${blingOrderId}/gerar-nfe`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const nfeId = response.data?.data?.id;

            // Tentar obter o link ou chave da nota para atualizar no banco
            try {
                const nfeDetail = await axios.get(`${BLING_API_URL}/notas/fiscais/${nfeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const nfeData = nfeDetail.data?.data;
                if (nfeData) {
                    await supabase
                        .from('pedidos')
                        .update({
                            nfe_status: 'nota_emitida',
                            nfe_key: nfeData.chaveAcesso || nfeData.numero,
                            nfe_link: nfeData.linkDanfe || null
                        })
                        .filter('nfe_key', 'eq', String(blingOrderId));
                }
            } catch (e) {
                console.warn('⚠️ Nota gerada mas erro ao buscar detalhes extras:', e.message);
            }

            console.log(`✅ NF-e gerada com sucesso! ID: ${nfeId}`);

            return {
                success: true,
                nfeId: nfeId,
                message: 'NF-e gerada com sucesso.'
            };
        } catch (error) {
            console.error('❌ Erro ao emitir NF-e no Bling:', error.response?.data || error.message);
            throw error;
        }
    }

    async getStatus() {
        try {
            const { data: integration, error } = await supabase
                .from('integrations')
                .select('updated_at, service')
                .eq('service', 'bling')
                .single();

            if (error || !integration) return { connected: false };
            return { connected: true, last_update: integration.updated_at };
        } catch (error) {
            return { connected: false };
        }
    }

    async getProducts() {
        const token = await this.getAccessToken();
        try {
            const response = await axios.get(`${BLING_API_URL}/produtos`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limite: 1 }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products from Bling:', error.response?.data || error.message);
            throw error;
        }
    }

    async createProduct(productData) {
        const token = await this.getAccessToken();
        try {
            const response = await axios.post(`${BLING_API_URL}/produtos`, productData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating product in Bling:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new BlingService();
