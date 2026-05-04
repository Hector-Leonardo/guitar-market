export type Guitar = {
    
    id: number;
    name: string;
    image: string;
    description: string;
    price: number;
}

export type CartItem = Guitar & {
    quantity: number;
}

export type GuitarID = Guitar['id']

export type ShippingMethod = 'standard' | 'express' | 'overnight'

export type ShippingData = {
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    shippingMethod: ShippingMethod;
}

export type ShippingCost = {
    standard: number;
    express: number;
    overnight: number;
}

// ===== TIPOS PARA GESTIÓN DE ENVÍOS =====

export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled'

export type CarrierType = 'estafeta' | 'dhl' | 'fedex' | 'manual'

export type RefundData = {
    refundId?: string;
    amount?: number;
    status?: 'pending' | 'approved' | 'rejected';
    reason?: string;
    requestedAt?: string;
    processedAt?: string;
}

export type Shipment = {
    id: string;
    orderId: string;
    userId: string;
    paymentId?: string;
    shippingData: ShippingData;
    status: ShipmentStatus;
    trackingNumber?: string;
    carrier?: CarrierType;
    estimatedDelivery?: string;
    actualDelivery?: string;
    refundData?: RefundData;
    createdAt: string;
    updatedAt: string;
}

export type ShipmentUpdate = {
    status?: ShipmentStatus;
    trackingNumber?: string;
    carrier?: CarrierType;
    estimatedDelivery?: string;
    actualDelivery?: string;
}

export type ShipmentListItem = Pick<Shipment, 'id' | 'orderId' | 'status' | 'trackingNumber' | 'estimatedDelivery' | 'createdAt'> & {
    recipientName: string;
    city: string;
}

// ===== TIPOS PARA SISTEMA DE VENDEDORES =====

export type VendorInfo = {
    storeName: string;
    description?: string;
    totalSales: number;
    totalRevenue: number;
    rating: number;
    ratingCount: number;
    createdAt: string;
}

export type UserProfile = {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    vendorInfo?: VendorInfo;
    createdAt: string;
    updatedAt: string;
}

export type VendorProduct = {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    sales: number;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export type VendorOrder = {
    id: string;
    vendorId: string;
    orderId: string;
    buyerId: string;
    items: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export type VendorRating = {
    id: string;
    vendorId: string;
    buyerId: string;
    rating: number; // 1-5
    comment?: string;
    createdAt: string;
}