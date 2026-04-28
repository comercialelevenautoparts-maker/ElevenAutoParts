const axios = require('axios');
const supabase = require('../config/supabase');

class MelhorEnvioService {
    constructor() {
        this.token = process.env.MELHOR_ENVIO_TOKEN;
        this.baseUrl = process.env.MELHOR_ENVIO_ENV === 'production'
            ? 'https://melhorenvio.com.br/api/v2'
            : 'https://sandbox.melhorenvio.com.br/api/v2';
    }
    /**
     * Busca os dados do remetente (Perfil e Endereço Padrão) no Melhor Envio
     */
    async getSenderAddress() {
        try {
            // 1. Busca dados do perfil (para pegar o Documento)
            const userResponse = await axios.get(`${this.baseUrl}/me`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
                }
            });

            // 2. Busca endereços
            const addrResponse = await axios.get(`${this.baseUrl}/me/addresses`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
                }
            });

            const profile = userResponse.data;
            const addresses = addrResponse.data.data || addrResponse.data;
            const defaultAddr = addresses.find(addr => addr.default) || addresses[0];
            
            if (!defaultAddr) return null;

            return {
                name: profile.firstname + ' ' + (profile.lastname || ''),
                email: profile.email,
                document: profile.document || '47163218869',
                phone: String((typeof defaultAddr.phone === 'object' ? defaultAddr.phone.phone : defaultAddr.phone) || 
                       (typeof profile.phone === 'object' ? profile.phone.phone : profile.phone) || 
                       '11917321666').replace(/\D/g, ''),
                address: defaultAddr.address,
                number: defaultAddr.number,
                district: defaultAddr.district,
                city: defaultAddr.city.city,
                state_abbr: defaultAddr.city.state.state_abbr,
                postal_code: defaultAddr.postal_code
            };
        } catch (error) {
            console.warn('⚠️ Não foi possível buscar os dados automáticos no Melhor Envio. Usando fallback.');
            return null;
        }
    }

    /**
     * Adiciona um pedido ao carrinho do Melhor Envio
     * @param {string} orderId - ID do pedido no Supabase
     */
    async addToCart(orderId) {
        try {
            if (!this.token) {
                console.warn('⚠️ MELHOR_ENVIO_TOKEN não configurado.');
                return null;
            }

            // 1. Buscar detalhes do pedido
            const { data: order, error: orderError } = await supabase
                .from('pedidos')
                .select(`
                    *,
                    pedido_itens(
                        *,
                        produto:produtos(*)
                    )
                `)
                .eq('id', orderId)
                .single();

            if (orderError || !order) {
                throw new Error('Pedido não encontrado no Supabase');
            }

            // 2. Buscar endereço separadamente para evitar erro de relação (Relationship)
            const { data: addr, error: addrError } = await supabase
                .from('enderecos')
                .select('*')
                .eq('id', order.endereco_id)
                .single();

            if (orderError || !order) {
                throw new Error('Pedido não encontrado para Melhor Envio');
            }

            // 2. Montar o payload para o carrinho
            // O Melhor Envio exige dimensões e pesos. Usamos fallbacks se não houver no banco.
            const products = order.pedido_itens.map(item => ({
                name: item.nome_produto,
                quantity: item.quantidade,
                unitary_value: item.preco_unitario,
                weight: item.produto?.peso || 0.4,
                width: item.produto?.largura || 12,
                height: item.produto?.altura || 4,
                length: item.produto?.profundidade || 65
            }));

            // Buscamos o perfil do cliente para pegar o CPF e Telefone
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', order.user_id)
                .single();

            const cpfCliente = userProfile?.cpf ? userProfile.cpf.replace(/\D/g, '') : '';
            const phone = userProfile?.telefone || '11999999999';

            // Remetente (Buscando automaticamente da API ou usando fallback manual)
            let sender = await this.getSenderAddress();
            
            if (!sender) {
                sender = {
                    name: 'Eleven Auto Parts',
                    email: 'comercial.elevenautoparts@gmail.com',
                    document: process.env.MELHOR_ENVIO_SENDER_DOCUMENT || '47163218869',
                    phone: '11917321666',
                    address: 'Rua Himalaia', 
                    number: '230',
                    district: 'Centro',
                    city: 'São Paulo',
                    state_abbr: 'SP',
                    postal_code: process.env.MELHOR_ENVIO_CEP_ORIGEM || '01001000'
                };
            }

            // Destinatário (Cliente)
            const receiver = {
                name: userProfile?.nome || 'Cliente Eleven',
                email: userProfile?.email || 'contato@cliente.com.br',
                document: cpfCliente,
                phone: phone.replace(/\D/g, ''),
                address: addr?.logradouro || '',
                number: addr?.numero || '',
                complement: addr?.complemento || '',
                district: addr?.bairro || '',
                city: addr?.cidade || '',
                state_abbr: addr?.uf || '',
                postal_code: addr?.cep ? addr.cep.replace(/\D/g, '') : ''
            };

            // 3. Montar o Volume (Caixa) - Agrupamos tudo em uma caixa para as palhetas
            let totalWeight = 0;
            let maxWidth = 12;
            let maxHeight = 4;
            let maxLength = 65;

            order.pedido_itens.forEach(item => {
                const qty = item.quantidade || 1;
                totalWeight += (item.produto?.peso || 0.4) * qty;
                
                // Pegamos a maior dimensão entre os itens para garantir que caibam
                maxWidth = Math.max(maxWidth, item.produto?.largura || 12);
                maxHeight = Math.max(maxHeight, (item.produto?.altura || 4) * (qty > 2 ? 2 : 1)); // Ajuste simples de empilhamento
                maxLength = Math.max(maxLength, item.produto?.profundidade || 65);
            });

            const payload = {
                service: order.frete_service_id,
                from: sender,
                to: receiver,
                products: products, // Adicionado de volta para a Declaração de Conteúdo
                volumes: [
                    {
                        height: maxHeight,
                        width: maxWidth,
                        length: maxLength,
                        weight: totalWeight
                    }
                ],
                options: {
                    insurance_value: order.valor_total,
                    receipt: false,
                    own_hand: false,
                    reverse: false,
                    non_commercial: true 
                }
            };

            const response = await axios.post(`${this.baseUrl}/me/cart`, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'User-Agent': 'ElevenAutoParts (contato@elevenautoparts.com.br)'
                }
            });

            console.log(`✅ Pedido adicionado ao carrinho com sucesso! ID no ME: ${response.data.id}`);

            // 3. Atualizar o pedido no Supabase com o ID do Melhor Envio (opcional, para controle)
            await supabase
                .from('pedidos')
                .update({ 
                    metadata: { 
                        ...(order.metadata || {}), 
                        melhor_envio_id: response.data.id 
                    } 
                })
                .eq('id', orderId);

            return response.data;

        } catch (error) {
            console.error('❌ Erro ao enviar para Melhor Envio:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new MelhorEnvioService();
