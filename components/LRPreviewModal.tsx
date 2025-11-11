import React, { useRef, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';
import { LorryReceipt, CompanyDetails } from '../types';
import { DownloadIcon, WhatsAppIcon, EmailIcon, XIcon, SaveIcon, PhoneIcon } from './icons';

interface LRPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    lr: LorryReceipt;
    companyDetails: CompanyDetails;
    onSave?: (lr: LorryReceipt) => void;
    isReadOnly?: boolean;
}

declare const html2pdf: any;

// A dedicated component for the LR content to be reused for screen and print.
const LRContent = forwardRef<HTMLDivElement, { lr: LorryReceipt; companyDetails: CompanyDetails }>(({ lr, companyDetails }, ref) => {

    return (
        <div ref={ref} className="printable-area p-2 bg-white text-black font-serif min-w-[800px] lg:w-full mx-auto border-2 border-black">
            {/* Dynamic Header */}
            <div className="flex justify-between items-center pb-2 border-b-2 border-black text-[8px]">
                <div className="w-1/4 flex justify-start">
                    {companyDetails.logoUrl && <img src={companyDetails.logoUrl} alt="Company Logo" className="h-16 w-auto object-contain"/>}
                </div>
                <div className="w-1/2 text-center">
                    <h1 className="font-bold text-blue-800 text-lg leading-tight">{companyDetails.name}</h1>
                    {companyDetails.tagline && <p className="text-[9px] font-semibold">{companyDetails.tagline}</p>}
                    <p className="text-[7px] mt-1">{companyDetails.address}</p>
                </div>
                <div className="w-1/4 text-right flex flex-col items-end justify-between h-16">
                    <div>
                      <p className="font-semibold">{companyDetails.email}</p>
                      {companyDetails.contact.map(c => <p key={c} className="font-semibold">{c}</p>)}
                    </div>
                    <div className="border-2 border-red-600 px-2 py-0.5">
                        <span className="text-red-600 font-bold text-[9px]">{lr.lrType.toUpperCase()}</span>
                    </div>
                </div>
            </div>


            {/* Top Body Grid */}
            <div className="grid grid-cols-12 gap-x-1 text-[9px] mt-1">
                {/* Left Col */}
                <div className="col-span-4 flex flex-col">
                    <div className="border border-black p-1">
                        <span className="font-bold bg-white px-1 relative -top-3 text-red-600">Available At :</span>
                        <div className="-mt-2 grid grid-cols-2">
                            <p className="font-bold">AHMEDABAD</p>
                            <p className="font-bold">SURAT</p>
                            <p className="font-bold">VAPI</p>
                            <p className="font-bold">MUMBAI</p>
                            <p className="font-bold">PUNE</p>
                        </div>
                    </div>
                    <div className="border border-black p-1 mt-1">
                        <p className="font-bold text-center underline">CAUTION</p>
                        <p className="text-[7px]">This Consignment Will Not Be Detained Diverted,Re-Routed Or Re-Booked Without Consignee Bank Written Permission Will Be Delivered At the Destination.</p>
                    </div>
                     <div className="border border-black p-1 mt-1 flex-grow">
                        <p className="font-bold text-center underline">NOTICE</p>
                        <p className="text-[7px]">This consignment covered in this set of special lorry receipt shall be stored at the destination under the control of the transport operator & shall be delivered to or to the order of the Consignee bank whose name is mentioned in the lorry receipt. And under no circumstances be delivered to anyone without the written authority form the consignee Bank or its order endorsed on the Consignee Copy or on a separated Letter or Authority.</p>
                    </div>
                    <p className="mt-1">Consignor GST No.: <span className="font-bold">{lr.consignor.gst}</span></p>
                </div>
                {/* Mid Col */}
                <div className="col-span-4">
                    <div className="border border-black p-1">
                        <p className="font-bold text-center underline">AT OWNERS RISKS</p>
                        <p>Pan No. : {companyDetails.pan || 'CMFP S3661A'}</p>
                        <p>GST No. : <span className="text-red-600 font-bold">{companyDetails.gstn}</span></p>
                    </div>
                     <div className="border border-black p-1 mt-1 text-center">
                        <p className="font-bold underline">INSURANCE</p>
                        <p className="text-[8px] font-bold">The Customer Has Started That He Has Not Insured The Consignment</p>
                        <div className="flex justify-between mt-1 text-left">
                            <span>Policy No _________</span>
                            <span>Date _________</span>
                        </div>
                        <div className="flex justify-between mt-1 text-left">
                            <span>Amount _________</span>
                            <span>Risk _________</span>
                        </div>
                    </div>
                </div>
                {/* Right Col */}
                <div className="col-span-4 text-center">
                     <div className="border border-black p-1">
                        <p className="font-bold underline">SCHEDULE OF DEMURRAGE CHARGES</p>
                        <p className="text-[8px] font-bold">Demmurrage Chargeable After 5 days Arrival Of Goods Rs. 7/per Qtl.Per Day On Weight Charged</p>
                    </div>
                    <div className="border border-black p-1 mt-1 font-bold">Address Of Delivery : <span className="font-normal">{lr.addressOfDelivery}</span></div>
                    <div className="border border-black p-1 mt-1 font-bold">Vehicle No. : <span className="font-normal">{lr.truckNo}</span></div>
                    <div className="border-y-2 border-black p-1 mt-1 font-bold">C NOTE No. : <span className="font-normal">{lr.lrNo}</span></div>
                    <div className="grid grid-cols-5 mt-1">
                        <div className="col-span-2 border border-black p-1 font-bold">DATE :</div>
                        <div className="col-span-3 border-y border-r border-black p-1">{new Date(lr.date).toLocaleDateString('en-GB')}</div>
                        <div className="col-span-2 border-x border-b border-black p-1 font-bold">FROM :</div>
                        <div className="col-span-3 border-r border-b border-black p-1">{lr.fromPlace}</div>
                        <div className="col-span-2 border-x border-b border-black p-1 font-bold">TO :</div>
                        <div className="col-span-3 border-r border-b border-black p-1">{lr.toPlace}</div>
                    </div>
                </div>
            </div>
            <p className="text-[9px] mt-1">Consignor : <span className="font-bold">{lr.consignor.name}</span></p>
            <p className="text-[9px]">Consignee : <span className="font-bold">{lr.consignee.name}</span></p>
            
            {/* Main Content Table */}
            <table className="w-full border-collapse border-2 border-black text-[8px] mt-1">
                <thead>
                    <tr className="font-bold text-center">
                        <td className="border-r-2 border-black p-1 w-[8%]">Packages</td>
                        <td className="border-r-2 border-black p-1">Description</td>
                        <td className="border-r-2 border-black p-1 w-[12%]" colSpan={2}>Weight</td>
                        <td className="border-r-2 border-black p-1 w-[15%]">Rate</td>
                        <td className="border-r-2 border-black p-1 w-[10%]">Amount</td>
                        <td className="p-1 w-[20%]">Any Other Information Remarks</td>
                    </tr>
                    <tr className="font-bold text-center">
                        <td className="border-t-2 border-r-2 border-black"></td>
                        <td className="border-t-2 border-r-2 border-black"></td>
                        <td className="border-t-2 border-r border-black p-1">Actual</td>
                        <td className="border-t-2 border-r-2 border-black p-1">Charged</td>
                        <td className="border-t-2 border-r-2 border-black"></td>
                        <td className="border-t-2 border-r-2 border-black"></td>
                        <td className="border-t-2 border-black"></td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border-t-2 border-r-2 border-black p-1 text-center h-40 align-top">{lr.items.reduce((sum, item) => sum + item.pcs, 0)}</td>
                        <td className="border-t-2 border-r-2 border-black p-1 align-top">{lr.items.map(i => i.description).join(', ')}</td>
                        <td className="border-t-2 border-r border-black p-1 text-center align-top">{lr.items.reduce((sum, item) => sum + item.weight, 0)}</td>
                        <td className="border-t-2 border-r-2 border-black p-1 text-center align-top">{lr.chargedWeight}</td>
                        <td className="border-t-2 border-r-2 border-black p-0 align-top">
                            <div className="grid grid-cols-2 h-full text-center">
                                <div className="border-b border-r border-black p-1">Hamail</div><div className="border-b border-black p-1"></div>
                                <div className="border-b border-r border-black p-1">Sur.CH.</div><div className="border-b border-black p-1"></div>
                                <div className="border-b border-r border-black p-1">St.CH.</div><div className="border-b border-black p-1"></div>
                                <div className="border-b border-r border-black p-1">Collection CH.</div><div className="border-b border-black p-1"></div>
                                <div className="border-b border-r border-black p-1">D.Dty CH.</div><div className="border-b border-black p-1"></div>
                                <div className="border-b border-r border-black p-1">Other CH.</div><div className="border-b border-black p-1"></div>
                                <div className="border-b border-r border-black p-1">Risk CH.</div><div className="border-b border-black p-1"></div>
                                <div className="border-r border-black p-1 font-bold">Total</div><div className="p-1 font-bold"></div>
                            </div>
                        </td>
                        <td className="border-t-2 border-r-2 border-black p-1 align-top text-center font-bold">{lr.freight.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className="border-t-2 border-black p-1 align-top">
                            {lr.remark}
                            <p className="mt-4">To PAY Rs. : </p>
                            <p className="mt-4">Paid RS. : </p>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3} className="border-t-2 border-r-2 border-black p-1">
                            <span className="text-red-600">Invoice No.:</span> {lr.invoiceNo} <span className="text-red-600 ml-4">Date:</span> {lr.invoiceDate ? new Date(lr.invoiceDate).toLocaleDateString('en-GB'): ''}
                        </td>
                        <td className="border-t-2 border-r-2 border-black p-1">Mark</td>
                        <td className="border-t-2 border-r-2 border-black p-1"></td>
                        <td className="border-t-2 border-r-2 border-black p-1"></td>
                        <td className="border-t-2 border-black p-1"></td>
                    </tr>
                    <tr className="h-full">
                        <td colSpan={4} className="border-t-2 border-r-2 border-black p-1 text-[7px] align-top relative">
                            <div>
                                <p>Endorsement Its Is Intended To use Consignee Copy Of the Set For The Purpose Of Borrowing From The Consignee Bank</p>
                                <p className="my-2">The Court In Delhi Alone Shall Have Jurisdiction In Respect Of The Claims And Matters Arising Under The Consignment Or Of The Claims And Matter Arising Under The Goods Entrusted For Transport</p>
                                <p className="mt-4">Value :</p>
                            </div>
                            {lr.consignor.stampUrl && (
                                <div className="absolute bottom-1 left-1">
                                    <img src={lr.consignor.stampUrl} alt="Consignor Stamp" className="h-16 w-auto object-contain" />
                                </div>
                            )}
                        </td>
                        <td colSpan={3} className="border-t-2 border-black p-1 align-bottom">
                            <div className="flex justify-end items-end h-full">
                                <div className="text-right">
                                    {companyDetails.signatureImageUrl && (
                                        <img src={companyDetails.signatureImageUrl} alt="Authorized Signatory" className="h-20 w-auto object-contain" />
                                    )}
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});


const LRPreviewModal: React.FC<LRPreviewModalProps> = ({ isOpen, onClose, lr, companyDetails, onSave, isReadOnly = false }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const printRoot = document.getElementById('print-root');

    const handleDownloadPDF = () => {
        const element = previewRef.current;
        if (!element) return;
        
        const opt = {
            margin:       [2, 2, 2, 2], // top, left, bottom, right in mm
            filename:     `LR-${lr.lrNo.replace('/', '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
    };
    
    const handleShareWhatsApp = async () => {
        const element = previewRef.current;
        if (!element) {
            toast.error("Preview content not found. Cannot generate PDF.");
            return;
        };

        const filename = `LR-${lr.lrNo.replace('/', '_')}.pdf`;
        const message = `Hi ${lr.consignee?.name}, here is the Lorry Receipt (LR No. ${lr.lrNo}) for your shipment.`;
        
        try {
            const opt = {
                margin:       [2, 2, 2, 2],
                filename:     filename,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
            const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: `Lorry Receipt ${lr.lrNo}`,
                    text: message,
                });
            } else {
                toast.error('Your browser doesn\'t support sharing files. Please download the PDF and share it manually.', { duration: 5000 });
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') { // AbortError is when the user cancels the share dialog
                console.error('Error sharing file:', error);
                toast.error('An error occurred while trying to share the file.');
            }
        }
    };

    const handleShareEmail = () => {
        const email = lr.consignee?.gst || ''; // Assuming email is in gst field for now
        const subject = encodeURIComponent(`Lorry Receipt (LR No: ${lr.lrNo}) for your shipment`);
        const body = encodeURIComponent(`Dear ${lr.consignee?.name},\n\nPlease find the details for your shipment with LR No. ${lr.lrNo}.\n\nWe advise you to download the attached PDF for your records.\n\nThank you,\n${companyDetails.name}`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };


    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start p-2 sm:p-4 overflow-auto">
            {/* Render a copy of the content specifically for printing, outside the visible modal */}
            {printRoot && ReactDOM.createPortal(<LRContent lr={lr} companyDetails={companyDetails} />, printRoot)}

            {/* The visible modal for on-screen preview */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8">
                <div className="p-4 bg-gray-100 rounded-t-lg flex flex-wrap justify-between items-center gap-2 sticky top-0 z-10">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">LR Preview & Actions</h2>
                    <div className="flex items-center flex-wrap gap-2">
                        {!isReadOnly && onSave && <button onClick={() => onSave(lr)} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 font-semibold"><SaveIcon className="w-5 h-5 mr-1"/>Save LR</button>}
                        <button onClick={handleDownloadPDF} className="flex items-center bg-ssk-red text-white px-3 py-2 rounded-md hover:bg-red-700 font-semibold"><DownloadIcon className="w-5 h-5 mr-1"/>Download PDF</button>
                        <button onClick={handleShareWhatsApp} className="flex items-center bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 font-semibold"><WhatsAppIcon className="w-5 h-5 mr-1"/>WhatsApp</button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-300"><XIcon className="w-6 h-6"/></button>
                    </div>
                </div>

                <div className="p-2 sm:p-4 overflow-x-auto">
                    <LRContent ref={previewRef} lr={lr} companyDetails={companyDetails} />
                </div>
            </div>
        </div>
    );
};

export default LRPreviewModal;
