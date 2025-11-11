import React, { useRef, forwardRef } from 'react';
import { LorryReceipt, CompanyDetails } from '../types';
import { DownloadIcon, XIcon } from './icons';
import { toWords } from '../utils/numberToWords';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    lorryReceipts: LorryReceipt[];
    companyDetails: CompanyDetails;
}

declare const html2pdf: any;

const InvoiceContent = forwardRef<HTMLDivElement, { lorryReceipts: LorryReceipt[], companyDetails: CompanyDetails }>(({ lorryReceipts, companyDetails }, ref) => {
    const totalAmount = lorryReceipts.reduce((sum, lr) => sum + (lr.freight || 0) + (lr.otherCharges || 0), 0);
    const totalCgst = lorryReceipts.reduce((sum, lr) => sum + (lr.cgst || 0), 0);
    const totalSgst = lorryReceipts.reduce((sum, lr) => sum + (lr.sgst || 0), 0);
    const totalIgst = lorryReceipts.reduce((sum, lr) => sum + (lr.igst || 0), 0);
    const netAmount = totalAmount + totalCgst + totalSgst + totalIgst;
    const amountInWords = toWords(Math.round(netAmount));

    return (
        <div ref={ref} className="printable-area p-4 bg-white text-black font-sans min-w-[700px] lg:w-full mx-auto border border-black text-[10px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 font-bold text-xs">
                <h2>GST :- {companyDetails.gstn}</h2>
                <h2>DATE :- {new Date().toLocaleDateString('en-GB')}</h2>
            </div>
            
            {/* Table */}
            <table className="w-full border-collapse border border-black">
                <thead className="font-bold">
                    <tr className="bg-gray-100">
                        <th className="border border-black p-1 w-[5%]">Sr.No</th>
                        <th className="border border-black p-1 w-[10%]">Date</th>
                        <th className="border border-black p-1 w-[12%]">Truck</th>
                        <th className="border border-black p-1 w-[8%]">LR No.</th>
                        <th className="border border-black p-1">From</th>
                        <th className="border border-black p-1">To</th>
                        <th className="border border-black p-1 w-[10%]">Freight</th>
                        <th className="border border-black p-1 w-[10%]">Other Charges</th>
                        <th className="border border-black p-1 w-[10%]">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {lorryReceipts.map((lr, index) => (
                        <tr key={lr.lrNo} style={{ height: '24px' }}>
                            <td className="border border-black p-1 text-center">{index + 1}</td>
                            <td className="border border-black p-1 text-center">{new Date(lr.date).toLocaleDateString('en-GB')}</td>
                            <td className="border border-black p-1">{lr.truckNo}</td>
                            <td className="border border-black p-1 text-center">{lr.lrNo.replace('DEL/', '')}</td>
                            <td className="border border-black p-1">{lr.fromPlace}</td>
                            <td className="border border-black p-1">{lr.toPlace}</td>
                            <td className="border border-black p-1 text-right">{lr.freight.toFixed(2)}</td>
                            <td className="border border-black p-1 text-right">{lr.otherCharges.toFixed(2)}</td>
                            <td className="border border-black p-1 text-right">{(lr.freight + lr.otherCharges).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows */}
                    {Array.from({ length: Math.max(0, 15 - lorryReceipts.length) }).map((_, i) => (
                        <tr key={`empty-${i}`} style={{ height: '24px' }}>
                            {Array.from({ length: 9 }).map((_, j) => <td key={j} className="border border-black"></td>)}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer section */}
            <div className="flex flex-col sm:flex-row justify-between mt-1">
                <div className="w-full sm:w-[60%]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 font-bold">
                        <p>GSTIN : {companyDetails.gstn}</p>
                        <p>PAN No. : {companyDetails.pan}</p>
                    </div>
                    <div className="mt-2 font-bold">BANK DETAILS</div>
                    <p><span className="font-bold">BANK NAME :</span> {companyDetails.bankDetails.name}</p>
                    <p><span className="font-bold">BRANCH :</span> {companyDetails.bankDetails.branch}</p>
                    <p><span className="font-bold">A/C NO. :</span> {companyDetails.bankDetails.accountNo}</p>
                    <p><span className="font-bold">IFSCCODE :</span> {companyDetails.bankDetails.ifscCode}</p>
                </div>
                <div className="w-full sm:w-[35%] mt-4 sm:mt-0">
                    <table className="w-full border-collapse border border-black">
                        <tbody>
                            <tr>
                                <td className="border border-black p-1 font-bold">AMOUNT</td>
                                <td className="border border-black p-1 text-right">{totalAmount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1">CGST</td>
                                <td className="border border-black p-1 text-right">{totalCgst.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1">SGST</td>
                                <td className="border border-black p-1 text-right">{totalSgst.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1">IGST</td>
                                <td className="border border-black p-1 text-right">{totalIgst.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Net Amount and Signature */}
            <div className="flex flex-col sm:flex-row justify-between items-end mt-2 flex-grow">
                <div className="self-start sm:self-end mt-4 sm:mt-0">
                    <p><span className="font-bold">Rupees(word):</span> {amountInWords} Rupees</p>
                </div>
                <div className="text-right mt-4 sm:mt-0 self-end">
                     <div className="border-t border-b border-black py-1">
                        <p className="font-bold">NET AMOUNT <span className="ml-4">{netAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
                     </div>
                     <div className="mt-8 flex flex-col items-center">
                         <img src="https://i.ibb.co/tZ5G1wB/invoice-signature.png" alt="Signature" className="h-16 object-contain" />
                         <p className="font-bold -mt-2">Authorized Signatory</p>
                     </div>
                </div>
            </div>
        </div>
    );
});

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, lorryReceipts, companyDetails }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    if (!isOpen) return null;

    const handleDownloadPDF = () => {
        const element = previewRef.current;
        if (!element) return;
        
        const opt = {
            margin:       [5, 2, 5, 2], // top, left, bottom, right in mm
            filename:     `Bill-${new Date().toISOString().split('T')[0]}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start p-2 sm:p-4 overflow-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8">
                <div className="p-4 bg-gray-100 rounded-t-lg flex flex-wrap justify-between items-center gap-2 sticky top-0 z-10">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Invoice Preview</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleDownloadPDF} className="flex items-center bg-ssk-red text-white px-3 py-2 rounded-md hover:bg-red-700 font-semibold">
                            <DownloadIcon className="w-5 h-5 mr-1"/>Download PDF
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-300">
                            <XIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
                <div className="p-2 sm:p-4 overflow-x-auto">
                    <InvoiceContent ref={previewRef} lorryReceipts={lorryReceipts} companyDetails={companyDetails} />
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
