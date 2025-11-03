import React, { useState, useCallback, useRef, useEffect } from 'react';
import Input from './components/Input';
import ResultDisplay from './components/ResultDisplay';
import { GoogleGenAI } from '@google/genai';

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

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

type DiscountType = 'percentage' | 'fixed';

const App: React.FC = () => {
    const [originalPrice, setOriginalPrice] = useState<string>('');
    const [discount, setDiscount] = useState<string>('');
    const [discountType, setDiscountType] = useState<DiscountType>('percentage');
    const [result, setResult] = useState<{ finalPrice: number; savedAmount: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
 const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
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
        setResult(null);
        setError(null);
    };

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    }, []);

    const handleScanClick = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsScanning(true);
            } catch (err: unknown) {
                console.error("Error accessing camera: ", err);
                if (err instanceof DOMException) {
                    if (err.name === 'NotAllowedError') {
                        setError("Camera permission denied. Please enable camera access in your browser settings to use this feature.");
                    } else if (err.name === 'NotFoundError') {
                        setError("No camera found on your device. Please try another device or connect a camera.");
                    } else {
                        setError("Could not access the camera. It might be in use by another application or there could be a driver issue.");
                    }
                } else {
                    setError("An unknown error occurred while trying to access the camera.");
                }
            }
        } else {
            setError("Your browser does not support camera access.");
        }
    }, []);
    
    const handleCaptureAndProcess = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;
        
        setIsProcessing(true);
        setError(null);
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (!context) {
            setError("Could not get canvas context.");
            setIsProcessing(false);
            return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        stopCamera();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image,
                },
            };
            const textPart = {
                text: "Extract only the numerical value of the largest price tag visible in this image. Do not include any currency symbols, commas, or text. For example, if you see '$19.99', return '19.99'."
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            const text = response.text.trim();
            
            const price = parseFloat(text.replace(/[^0-9.]/g, ''));

            if (!isNaN(price) && price > 0) {
                setOriginalPrice(String(price));
                setResult(null);
            } else {
                setError(`Could not automatically detect a valid price from "${text}". Please enter it manually.`);
            }

        } catch (e) {
            console.error(e);
            setError("Failed to process image. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, stopCamera]);

    const handleDiscountTypeChange = (type: DiscountType) => {
        if (type !== discountType) {
            setDiscountType(type);
            setDiscount('');
        }
    };

    return (
        <>
        {isScanning && (
                <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl h-auto rounded-lg shadow-2xl mb-4 aspect-video bg-slate-900"></video>
                    <div className="mt-4 flex space-x-4">
                        <button 
                            onClick={handleCaptureAndProcess} 
                            disabled={isProcessing}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-all shadow-lg disabled:bg-indigo-400 disabled:cursor-not-allowed w-40 flex justify-center items-center"
                        >
                            {isProcessing ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Capture Price'}
                        </button>
                        <button 
                            onClick={stopCamera} 
                            disabled={isProcessing}
                            className="px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 transition-all shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
            )}
        <div className="min-h-screen flex items-start justify-center p-4 pt-8 md:items-center md:pt-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Discount Calculator</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Find out your final price after savings.</p>
                </div>

                <div className="mt-8 space-y-6">
                    {/* <Input
                        id="originalPrice"
                        label="Original Price"
                        type="number"
                        placeholder="e.g., 100"
                        value={originalPrice}
                        onChange={handleInputChange(setOriginalPrice)}
                        icon={<DollarIcon />}
                        min="0"
                    /> */}
                    <Input
                            id="originalPrice"
                            label="Original Price"
                            type="number"
                            placeholder="e.g., 100"
                            value={originalPrice}
                            onChange={handleInputChange(setOriginalPrice)}
                            icon={<DollarIcon />}
                            actionIcon={<CameraIcon />}
                            onActionClick={handleScanClick}
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

    </>
    );
};

export default App;