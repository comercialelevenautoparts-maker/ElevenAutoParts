import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const BlingIntegration = () => {
    const [status, setStatus] = useState<{ connected: boolean; last_update?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const checkStatus = async () => {
        setLoading(true);
        try {
            // Assuming backend is proxying or CORS is handled. 
            // In dev with Vite, we might need to point to localhost:3000 directly if proxy isn't set
            const backendUrl = "http://localhost:3000"; // Or use import.meta.env.VITE_API_URL
            const res = await fetch(`${backendUrl}/api/bling/status`);
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error("Failed to fetch status", error);
            toast.error("Erro ao verificar status da conexão com Bling");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();

        // Check for success param in URL (after callback redirect)
        const params = new URLSearchParams(window.location.search);
        if (params.get("status") === "success") {
            toast.success("Conexão com Bling realizada com sucesso!");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (params.get("status") === "error") {
            toast.error("Falha na conexão com Bling.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleConnect = () => {
        window.location.href = "http://localhost:3000/api/bling/auth";
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Integração Bling (ERP)</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Status da Conexão
                            {loading ? (
                                <Badge variant="outline" className="animate-pulse">Verificando...</Badge>
                            ) : status?.connected ? (
                                <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Conectado
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <XCircle size={14} /> Desconectado
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Gerencie a conexão da sua loja com o ERP Bling para emissão de notas fiscais.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status?.connected ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
                                    <p className="font-medium">Sua loja está conectada ao Bling.</p>
                                    <p className="text-sm mt-1">Última atualização do token: {status.last_update ? new Date(status.last_update).toLocaleString() : 'N/A'}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={checkStatus}>
                                        <RefreshCw className="mr-2 h-4 w-4" /> Verificar Status
                                    </Button>
                                    <Button onClick={handleConnect}>
                                        Reconectar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
                                    <p className="font-medium">Conexão necessária</p>
                                    <p className="text-sm mt-1">
                                        Para emitir notas fiscais automaticamente, você precisa autorizar o acesso à sua conta do Bling.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button onClick={handleConnect} className="w-full sm:w-auto bg-[#ff6b00] hover:bg-[#e66000]">
                                        Conectar com Bling <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Instruções de Configuração</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-gray-600 space-y-2">
                        <p>1. Acesse sua conta de desenvolvedor no Bling.</p>
                        <p>2. Crie um aplicativo e defina a URL de Callback como: <code className="bg-gray-100 px-1 rounded">http://localhost:3000/api/bling/callback</code> (para desenvolvimento).</p>
                        <p>3. Copie o <strong>Client ID</strong> e <strong>Client Secret</strong> e adicione ao arquivo <code>.env</code> do backend.</p>
                        <p>4. Certifique-se de selecionar os escopos: <code>vendas:write</code>, <code>vendas:read</code>, <code>produtos:read</code>, <code>contatos:read</code>, <code>notas_fiscais:write</code>.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BlingIntegration;
