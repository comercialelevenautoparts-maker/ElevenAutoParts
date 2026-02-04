import React from 'react';

interface PaymentMethodsProps {
    className?: string;
    compact?: boolean;
}

const PaymentMethods = ({ className = "", compact = false }: PaymentMethodsProps) => {
    return (
        <div className={`mt-6 pt-6 border-t border-border ${className}`}>
            <h3 className={`font-bold text-foreground mb-3 font-sans ${compact ? 'text-[10px]' : 'text-sm md:text-sm'}`}>
                Formas de Pagamento
            </h3>
            <div className={`flex items-center w-full overflow-hidden ${compact ? 'gap-1' : 'gap-1.5 md:gap-2'} flex-nowrap justify-between sm:justify-start`}>
                {/* Elo */}
                <div className={`border border-border/60 rounded p-1 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all flex-1 min-w-0 ${compact ? 'h-5 max-w-[40px]' : 'h-7 sm:h-8 sm:max-w-[48px]'}`}>
                    <img
                        src="https://images.seeklogo.com/logo-png/28/1/elo-logo-png_seeklogo-286069.png"
                        alt="Elo"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* AMEX */}
                <div className={`border border-border/60 rounded p-1 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all flex-1 min-w-0 ${compact ? 'h-5 max-w-[40px]' : 'h-7 sm:h-8 sm:max-w-[48px]'}`}>
                    <img
                        src="https://www.pngmart.com/files/23/American-Express-Logo-PNG-HD.png"
                        alt="Amex"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Pix */}
                <div className={`border border-border/60 rounded p-1 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all flex-1 min-w-0 ${compact ? 'h-5 max-w-[40px]' : 'h-7 sm:h-8 sm:max-w-[48px]'}`}>
                    <img
                        src="https://artpoin.com/wp-content/uploads/2023/09/artpoin-logo-pix.png"
                        alt="Pix"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Mastercard */}
                <div className={`border border-border/60 rounded p-1 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all flex-1 min-w-0 ${compact ? 'h-5 max-w-[40px]' : 'h-7 sm:h-8 sm:max-w-[48px]'}`}>
                    <img
                        src="https://logos-world.net/wp-content/uploads/2020/09/MasterCard-Logo-1979-1990.png"
                        alt="Mastercard"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Hipercard */}
                <div className={`border border-border/60 rounded p-1 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all flex-1 min-w-0 ${compact ? 'h-5 max-w-[40px]' : 'h-7 sm:h-8 sm:max-w-[48px]'}`}>
                    <img
                        src="https://iconape.com/wp-content/files/ns/183492/png/hipercard-logo.png"
                        alt="Hipercard"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Visa */}
                <div className={`border border-border/60 rounded p-1 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all flex-1 min-w-0 ${compact ? 'h-5 max-w-[40px]' : 'h-7 sm:h-8 sm:max-w-[48px]'}`}>
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/320px-Visa_Inc._logo.svg.png"
                        alt="Visa"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
