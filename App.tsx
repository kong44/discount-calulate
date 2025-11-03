import React, { useState, useEffect } from 'react';
import Input from './components/Input';
import ResultDisplay from './components/ResultDisplay';

const DollarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PercentIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l10-10m-10 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm10 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
);

type DiscountType = 'percentage' | 'fixed';

const App: React.FC = () => {
    const [originalPrice, setOriginalPrice] = useState<string>('');
    const [discount, setDiscount] = useState<string>('');
    const [discountType, setDiscountType] = useState<DiscountType>('percentage');
    const [result, setResult] = useState<{ finalPrice: number; savedAmount: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!originalPrice || !discount) {
            setResult(null);
            setError(null);
            return;
        }

        setError(null);
        setResult(null);

        const price = parseFloat(originalPrice);
        const discountValue = parseFloat(discount);
        const isPercentage = discountType === 'percentage';

        if (isNaN(price) || price < 0) {
            setError('Please enter a valid original price.');
            return;
        }

        if (isPercentage) {
            if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
                setError('Discount must be between 0 and 100.');
                return;
            }
            const savedAmount = price * (discountValue / 100);
            const finalPrice = price - savedAmount;
            setResult({ finalPrice, savedAmount });
        } else { // Fixed amount
            if (isNaN(discountValue) || discountValue < 0) {
                setError('Please enter a valid discount amount.');
                return;
            }
            if (discountValue > price) {
                setError('Discount cannot be greater than the original price.');
                return;
            }
            const savedAmount = discountValue;
            const finalPrice = price - savedAmount;
            setResult({ finalPrice, savedAmount });
        }
    }, [originalPrice, discount, discountType]);

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
    };

    const handleDiscountTypeChange = (type: DiscountType) => {
        if (type !== discountType) {
            setDiscountType(type);
            setDiscount('');
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center p-4 pt-8 md:items-center md:pt-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Discount Calculator</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Find out your final price after savings.</p>
                </div>

                <div className="mt-8 space-y-6">
                    <Input
                        id="originalPrice"
                        label="Original Price"
                        type="number"
                        placeholder="e.g., 100"
                        value={originalPrice}
                        onChange={handleInputChange(setOriginalPrice)}
                        icon={<DollarIcon />}
                        min="0"
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Discount Type
                        </label>
                        <div className="flex rounded-md shadow-sm bg-slate-200 dark:bg-slate-700 p-1">
                            <button
                                type="button"
                                onClick={() => handleDiscountTypeChange('percentage')}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                    discountType === 'percentage'
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                }`}
                                aria-pressed={discountType === 'percentage'}
                            >
                                Percentage (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDiscountTypeChange('fixed')}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                    discountType === 'fixed'
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                }`}
                                aria-pressed={discountType === 'fixed'}
                            >
                                Fixed Amount ($)
                            </button>
                        </div>
                    </div>

                    <Input
                        id="discount"
                        label={discountType === 'percentage' ? 'Discount Percentage (%)' : 'Fixed Discount Amount'}
                        type="number"
                        placeholder={discountType === 'percentage' ? 'e.g., 25' : 'e.g., 10'}
                        value={discount}
                        onChange={handleInputChange(setDiscount)}
                        icon={discountType === 'percentage' ? <PercentIcon /> : <DollarIcon />}
                        min="0"
                        max={discountType === 'percentage' ? '100' : undefined}
                    />
                </div>

                {error && (
                    <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm text-center transition-opacity duration-300">
                        {error}
                    </div>
                )}

                {result && !error && (
                    <ResultDisplay finalPrice={result.finalPrice} savedAmount={result.savedAmount} />
                )}
            </div>
        </div>
    );
};

export default App;