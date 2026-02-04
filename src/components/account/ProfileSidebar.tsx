import { Link, useLocation } from 'react-router-dom';
import { User, Package, Heart, Gift, Truck, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSidebar = () => {
    const { signOut } = useAuth();
    const location = useLocation();

    const menuItems = [
        { icon: User, label: 'Informações pessoais', href: '/perfil' },
        { icon: Package, label: 'Meus pedidos', href: '/pedidos' },
        { icon: Heart, label: 'Minha lista de desejos', href: '/favoritos' },
        { icon: Gift, label: 'Indique e ganhe', href: '/indique-e-ganhe' },
        { icon: Truck, label: 'Rastreamento', href: '/rastreio' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="lg:col-span-1">
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default ProfileSidebar;
