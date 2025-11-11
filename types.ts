export interface PartyDetails {
    name: string;
    address: string;
    city: string;
    contact: string;
    pan: string;
    gst: string;
    stampUrl?: string;
}

export interface Item {
    description: string;
    pcs: number;
    weight: number;
}

export interface BankDetails {
    name: string;
    branch: string;
    accountNo: string;
    ifscCode: string;
}

export interface LorryReceipt {
    lrType: 'Original' | 'Dummy';
    truckNo: string;
    lrNo: string;
    date: string;
    fromPlace: string;
    toPlace: string;

    invoiceNo: string;
    invoiceAmount: number;
    invoiceDate: string;
    poNo: string;
    poDate: string;

    ewayBillNo: string;
    ewayBillDate: string;
    ewayExDate: string;
    
    methodOfPacking: string;
    addressOfDelivery: string;
    chargedWeight: number;
    lorryType: string;

    billingTo: PartyDetails;
    gstPaidBy: string;

    consignor: PartyDetails;
    consignee: PartyDetails;

    agent: string;
    items: Item[];

    weight: number;
    actualWeightMT: number;
    height: number;
    extraHeight: number;

    freight: number;
    otherCharges: number;
    cgst: number;
    sgst: number;
    igst: number;
    rate: number;
    rateOn: string;

    remark: string;
    employee: string;
    truckDriverNo: string;

    // Added for list view consistency
    createdBy?: string;
}

export interface CompanyDetails {
    name: string;
    logoUrl: string;
    signatureImageUrl: string;
    tagline: string;
    address: string;
    email: string;
    web: string;
    contact: string[];
    pan: string;
    gstn: string;
    bankDetails: BankDetails;
}
