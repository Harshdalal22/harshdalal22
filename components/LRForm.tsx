import React, { useState, useEffect } from 'react';
import { LorryReceipt, Item, PartyDetails } from '../types';
import LRPreviewModal from './LRPreviewModal';
import { PlusIcon, TrashIcon, CreateIcon, ListIcon } from './icons';

interface LRFormProps {
    onSave: (lr: LorryReceipt) => void;
    existingLR: LorryReceipt | null;
    onCancel: () => void;
    companyDetails: any;
    lorryReceipts: LorryReceipt[];
}

const initialLRState: Omit<LorryReceipt, 'lrNo'> = {
    lrType: 'Original',
    truckNo: '',
    date: new Date().toISOString().split('T')[0],
    fromPlace: '',
    toPlace: '',
    invoiceNo: '',
    invoiceAmount: 0,
    invoiceDate: '',
    poNo: '',
    poDate: '',
    ewayBillNo: '',
    ewayBillDate: '',
    ewayExDate: '',
    methodOfPacking: '',
    addressOfDelivery: '',
    chargedWeight: 0,
    lorryType: '',
    gstPaidBy: 'Transporter',
    consignor: { name: '', address: '', city: '', contact: '', pan: '', gst: '', stampUrl: '' },
    consignee: { name: '', address: '', city: '', contact: '', pan: '', gst: '', stampUrl: '' },
    billingTo: { name: '', address: '', city: '', contact: '', pan: '', gst: '', stampUrl: '' },
    agent: '',
    items: [{ description: 'corrugated box', pcs: 1, weight: 0 }],
    weight: 0,
    actualWeightMT: 0,
    height: 0,
    extraHeight: 0,
    freight: 0,
    otherCharges: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    rate: 0,
    rateOn: '',
    remark: '',
    employee: '',
    truckDriverNo: '',
};

const generateNewLrNo = (existingLrs: LorryReceipt[]): string => {
    const lrNumbers = existingLrs
        .map(lr => parseInt(lr.lrNo.replace('DEL/', ''), 10))
        .filter(num => !isNaN(num));

    if (lrNumbers.length === 0) {
        return 'DEL/1001'; // Starting number if no LRs exist
    }

    const maxLrNo = Math.max(...lrNumbers);
    return `DEL/${maxLrNo + 1}`;
};


const LRForm: React.FC<LRFormProps> = ({ onSave, existingLR, onCancel, companyDetails, lorryReceipts }) => {
    const [formData, setFormData] = useState<LorryReceipt>(() => ({
        ...initialLRState,
        lrNo: existingLR ? existingLR.lrNo : generateNewLrNo(lorryReceipts),
    }));
    const [showPreview, setShowPreview] = useState(false);
    
    useEffect(() => {
        if (existingLR) {
            setFormData(existingLR);
        } else {
            setFormData({
                ...initialLRState,
                lrNo: generateNewLrNo(lorryReceipts)
            });
        }
    }, [existingLR, lorryReceipts]);

    useEffect(() => {
        const totalWeight = formData.items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
        setFormData(prev => ({ ...prev, weight: totalWeight }));
    }, [formData.items]);

    useEffect(() => {
        const totalChargeable = (Number(formData.freight) || 0) + (Number(formData.otherCharges) || 0);
        // Assuming fixed GST rates for now as per invoice image (2.5% + 2.5%)
        const cgstAmount = totalChargeable * 0.025;
        const sgstAmount = totalChargeable * 0.025;
        
        setFormData(prev => ({
            ...prev,
            cgst: cgstAmount,
            sgst: sgstAmount,
            igst: 0, // Assuming no IGST for simplicity
        }));
    }, [formData.freight, formData.otherCharges]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePartyChange = (party: 'consignor' | 'consignee' | 'billingTo', e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [party]: {
                ...prev[party],
                [name]: value
            }
        }));
    };

    const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>, partyKey: 'consignor') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    [partyKey]: {
                        ...prev[partyKey],
                        stampUrl: reader.result as string,
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', pcs: 0, weight: 0 }] }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.truckNo || !formData.fromPlace || !formData.toPlace || !formData.consignor.name || !formData.consignee.name) {
            alert('Please fill all required fields marked with *.');
            return;
        }
        onSave(formData);
        setShowPreview(true);
    };
    
    const handleClosePreviewAndExit = () => {
        setShowPreview(false);
        onCancel();
    };

    const handleCreateNew = () => {
        // This function will be linked to the new "+ Create New LR" button
        if(window.confirm('Are you sure you want to discard current changes and create a new LR?')) {
            setFormData({
                ...initialLRState,
                lrNo: generateNewLrNo(lorryReceipts)
            });
        }
    }
    
    const renderPartySection = (title: string, partyKey: 'consignor' | 'consignee' | 'billingTo') => (
        <div className="border border-gray-300">
            <h3 className="bg-ssk-red text-white p-2 font-bold text-sm">{title.toUpperCase()}</h3>
            <div className="p-2 space-y-1">
                <textarea name="name" value={formData[partyKey].name} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="NAME" className="w-full text-xs p-1 border rounded-sm text-gray-900 placeholder-gray-500" rows={2}></textarea>
                <textarea name="address" value={formData[partyKey].address} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="ADDRESS" className="w-full text-xs p-1 border rounded-sm text-gray-900 placeholder-gray-500" rows={3}></textarea>
                <input type="text" name="city" value={formData[partyKey].city} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="CITY" className="w-full text-xs p-1 border rounded-sm text-gray-900 placeholder-gray-500" />
                <input type="text" name="contact" value={formData[partyKey].contact} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="CONTACT" className="w-full text-xs p-1 border rounded-sm text-gray-900 placeholder-gray-500" />
                <input type="text" name="pan" value={formData[partyKey].pan} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="PAN" className="w-full text-xs p-1 border rounded-sm text-gray-900 placeholder-gray-500" />
                <input type="text" name="gst" value={formData[partyKey].gst} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="GST" className="w-full text-xs p-1 border rounded-sm text-gray-900 placeholder-gray-500" />
                 {partyKey === 'consignor' && (
                    <div className="pt-2">
                        <label className="block text-xs font-medium text-gray-700">Consignor Stamp</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleStampUpload(e, 'consignor')} 
                            className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300" 
                        />
                        {formData.consignor.stampUrl && (
                            <div className="mt-2">
                                <span className="block text-xs font-medium text-gray-700">Stamp Preview</span>
                                <img src={formData.consignor.stampUrl} alt="Stamp Preview" className="mt-1 h-16 w-auto object-contain border p-1 rounded-md bg-gray-100" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const inputClass = "w-full p-2 border-gray-200 bg-gray-100 rounded-md text-sm text-gray-900 placeholder-gray-500";
    const labelClass = "block text-xs font-bold text-gray-600 uppercase mb-1";

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
             {/* New Navigation Header */}
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <button onClick={onCancel} className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors text-sm">
                    <ListIcon className="w-5 h-5 mr-2" />
                    View LR Details
                </button>
                <button onClick={handleCreateNew} className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors text-sm">
                    <CreateIcon className="w-5 h-5 mr-2" />
                    Create New LR
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
                    {/* Row 1 */}
                    <div>
                        <label className={labelClass}>LR TYPE*</label>
                        <div className="flex items-center space-x-4 h-10">
                             <div className="flex items-center">
                                <input id="dummy" type="radio" name="lrType" value="Dummy" checked={formData.lrType === 'Dummy'} onChange={handleChange} className="h-4 w-4 text-ssk-blue focus:ring-ssk-blue border-gray-300" />
                                <label htmlFor="dummy" className="ml-2 block text-sm text-gray-900">Dummy</label>
                            </div>
                            <div className="flex items-center">
                                <input id="original" type="radio" name="lrType" value="Original" checked={formData.lrType === 'Original'} onChange={handleChange} className="h-4 w-4 text-ssk-blue focus:ring-ssk-blue border-gray-300"/>
                                <label htmlFor="original" className="ml-2 block text-sm text-gray-900">Original</label>
                            </div>
                        </div>
                    </div>
                    <div><label className={labelClass}>TRUCK NO*</label><input type="text" name="truckNo" placeholder="TRUCK NO" value={formData.truckNo} onChange={handleChange} className={`${inputClass} border-red-300`} required /></div>
                    <div><label className={labelClass}>LR NO*</label><input type="text" value={formData.lrNo} disabled className={`${inputClass} bg-gray-200 cursor-not-allowed`} /></div>
                    <div><label className={labelClass}>DATE*</label><input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className={labelClass}>FROM PLACE*</label><input type="text" name="fromPlace" placeholder="FROM PLACE" value={formData.fromPlace} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className={labelClass}>TO PLACE*</label><input type="text" name="toPlace" placeholder="TO PLACE" value={formData.toPlace} onChange={handleChange} className={inputClass} required /></div>

                    {/* Row 2 */}
                    <div><label className={labelClass}>INVOICE</label><input type="text" name="invoiceNo" placeholder="INVOICE" value={formData.invoiceNo} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>INVOICE AMOUNT</label><input type="number" name="invoiceAmount" placeholder="INVOICE AMOUNT" value={formData.invoiceAmount} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>INVOICE DATE</label><input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>EWAY BILL NO</label><input type="text" name="ewayBillNo" placeholder="EWAY BILL NO" value={formData.ewayBillNo} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>EWAY BILL DATE</label><input type="date" name="ewayBillDate" value={formData.ewayBillDate} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>EWAY EX. DATE</label><input type="date" name="ewayExDate" value={formData.ewayExDate} onChange={handleChange} className={inputClass} /></div>
                    
                    {/* Row 3 */}
                    <div><label className={labelClass}>P.O. NO</label><input type="text" name="poNo" placeholder="P.O. NO" value={formData.poNo} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>P.O. DATE</label><input type="date" name="poDate" value={formData.poDate} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>METHOD OF PACKING</label><input type="text" name="methodOfPacking" placeholder="METHOD OF PACKING" value={formData.methodOfPacking} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>ADDRESS OF DELIVERY</label><input type="text" name="addressOfDelivery" placeholder="ADDRESS OF DELIVERY" value={formData.addressOfDelivery} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>CHARGED WEIGHT</label><input type="number" name="chargedWeight" placeholder="CHARGED WEIGHT" value={formData.chargedWeight} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>LORRY TYPE</label><input type="text" name="lorryType" placeholder="LORRY TYPE" value={formData.lorryType} onChange={handleChange} className={inputClass} /></div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                     <div>
                        <label className={labelClass}>BILLING PARTY</label>
                        <input type="text" name="name" placeholder="Billing Party Name" value={formData.billingTo.name} onChange={(e) => handlePartyChange('billingTo', e)} className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>GST PAID BY</label>
                         <select name="gstPaidBy" value={formData.gstPaidBy} onChange={handleChange} className={inputClass}>
                            <option>Transporter</option>
                            <option>Consignor</option>
                            <option>Consignee</option>
                        </select>
                     </div>
                 </div>


                {/* Parties Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderPartySection('Consignor', 'consignor')}
                    {renderPartySection('Consignee', 'consignee')}
                    {renderPartySection('Billing To', 'billingTo')}
                </div>
                 <div className="flex items-center">
                    <label className="w-24 font-bold text-gray-900">AGENT</label>
                    <input type="text" name="agent" value={formData.agent} onChange={handleChange} className="w-full p-1 border text-gray-900 placeholder-gray-500" />
                </div>

                {/* Item Details Section */}
                <div className="border border-gray-200 p-3 rounded-md shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-base text-gray-800">Item Details</h3>
                        <button type="button" onClick={addItem} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-gray-200 transition-colors">
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Row
                        </button>
                    </div>
                    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-2 rounded-t-md font-bold text-gray-600 text-left text-xs">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">DESCRIPTION</div>
                        <div className="col-span-2">PCS</div>
                        <div className="col-span-2">WEIGHT</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="border-l border-r border-b border-gray-200 rounded-b-md">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border-b last:border-b-0">
                                <div className="col-span-1 text-gray-500">{index + 1}</div>
                                <div className="col-span-6"><input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full p-1.5 border rounded-md text-sm text-gray-900 placeholder-gray-500"/></div>
                                <div className="col-span-2"><input type="number" value={item.pcs} onChange={(e) => handleItemChange(index, 'pcs', parseInt(e.target.value) || 0)} className="w-full p-1.5 border rounded-md text-sm text-gray-900 placeholder-gray-500" placeholder="PCS" /></div>
                                <div className="col-span-2"><input type="number" value={item.weight} onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value) || 0)} className="w-full p-1.5 border rounded-md text-sm text-gray-900 placeholder-gray-500" placeholder="Weight"/></div>
                                <div className="col-span-1 text-right">
                                    {formData.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"><TrashIcon className="w-5 h-5"/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other fields Section */}
                <div className="space-y-4 pt-4 text-gray-800">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div>
                            <label className={labelClass}>TOTAL WEIGHT (MT)</label>
                            <input type="number" name="weight" value={formData.weight} readOnly placeholder="Auto-calculated" className={`${inputClass} bg-gray-200 cursor-not-allowed`} />
                        </div>
                        <div><label className={labelClass}>ACTUAL WEIGHT (MT)</label><input type="number" name="actualWeightMT" value={formData.actualWeightMT} onChange={handleChange} placeholder="WEIGHT (MT)" className={inputClass} /></div>
                        <div><label className={labelClass}>HEIGHT</label><input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="HEIGHT" className={inputClass} /></div>
                        <div><label className={labelClass}>EXTRA HEIGHT</label><input type="number" name="extraHeight" value={formData.extraHeight} onChange={handleChange} placeholder="EX HEIGHT" className={inputClass} /></div>
                        <div><label className={labelClass}>RATE</label><input type="number" name="rate" value={formData.rate} onChange={handleChange} placeholder="RATE" className={inputClass} /></div>
                        <div><label className={labelClass}>RATE ON</label><select name="rateOn" value={formData.rateOn} onChange={handleChange} className={inputClass}><option value="">Select Rate Type</option><option value="Ton">Ton</option><option value="Trip">Trip</option><option value="Pcs">Pcs</option></select></div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={labelClass}>FREIGHT</label><input type="number" name="freight" value={formData.freight} onChange={handleChange} placeholder="FREIGHT" className={inputClass} /></div>
                        <div><label className={labelClass}>OTHER CHARGES</label><input type="number" name="otherCharges" value={formData.otherCharges} onChange={handleChange} placeholder="OTHER CHARGES" className={inputClass} /></div>
                        <div>
                            <label className={labelClass}>TOTAL (FREIGHT + CHARGES)</label>
                            <input type="number" value={(Number(formData.freight) || 0) + (Number(formData.otherCharges) || 0)} readOnly className={`${inputClass} bg-gray-200 cursor-not-allowed`} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>CGST ({formData.cgst > 0 ? '2.5%' : '0%'})</label>
                             <input type="number" value={formData.cgst.toFixed(2)} readOnly className={`${inputClass} bg-gray-200 cursor-not-allowed`} />
                        </div>
                         <div>
                            <label className={labelClass}>SGST ({formData.sgst > 0 ? '2.5%' : '0%'})</label>
                             <input type="number" value={formData.sgst.toFixed(2)} readOnly className={`${inputClass} bg-gray-200 cursor-not-allowed`} />
                        </div>
                         <div>
                            <label className={labelClass}>NET TOTAL</label>
                             <input type="number" value={((Number(formData.freight) || 0) + (Number(formData.otherCharges) || 0) + formData.cgst + formData.sgst).toFixed(2)} readOnly className={`${inputClass} bg-green-100 border-green-300 font-bold cursor-not-allowed`} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>EMPLOYEE</label>
                            <input type="text" name="employee" value={formData.employee} onChange={handleChange} placeholder="Enter Employee Name" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>TRUCK DRIVER NO</label>
                            <input type="text" name="truckDriverNo" value={formData.truckDriverNo} onChange={handleChange} placeholder="Enter Driver No." className={inputClass} />
                        </div>
                    </div>
                    <div><label className={labelClass}>REMARK</label><textarea name="remark" value={formData.remark} onChange={handleChange} placeholder="Enter remarks..." className={`${inputClass} h-24`}></textarea></div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-center gap-4 pt-4 border-t">
                    <button type="submit" className="w-full sm:w-auto bg-ssk-blue text-white px-8 py-2.5 rounded-md hover:bg-blue-800 font-bold text-base shadow-md transition-transform transform hover:scale-105">
                        {existingLR ? 'UPDATE & SAVE' : 'PREVIEW & SAVE'}
                    </button>
                    <button type="button" onClick={onCancel} className="w-full sm:w-auto bg-ssk-red text-white px-8 py-2.5 rounded-md hover:bg-red-700 font-bold text-base shadow-md transition-transform transform hover:scale-105">
                        CANCEL
                    </button>
                </div>
            </form>
            
            {showPreview && (
                <LRPreviewModal 
                    isOpen={showPreview}
                    onClose={handleClosePreviewAndExit}
                    lr={formData}
                    companyDetails={companyDetails}
                    isReadOnly={true}
                />
            )}
        </div>
    );
};

export default LRForm;
