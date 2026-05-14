export type Guitar = {
    id: number | string;
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

export type SavedShippingAddress = {
    id: string;
    label: string;
    shippingData: ShippingData;
    createdAt: string;
    updatedAt: string;
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

export type ShipmentItem = {
    productId: string;
    title: string;
    quantity: number;
    unitPrice: number;
    image?: string;
}

export type Shipment = {
    id: string;
    orderId: string;
    userId: string;
    paymentId?: string;
    shippingData: ShippingData;
    items: ShipmentItem[];
    totalAmount: number;
    currency: string;
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
    refundData?: RefundData;
}

export type ShipmentListItem = Pick<Shipment, 'id' | 'orderId' | 'status' | 'trackingNumber' | 'estimatedDelivery' | 'createdAt'> & {
    recipientName: string;
    city: string;
    itemCount?: number;
    totalAmount?: number;
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

// ===== TIPOS PARA SISTEMA DE VENDEDORES Y PRODUCTOS =====

export type SellerProfile = {
    uid: string;
    storeName: string;
    description: string;
    kycStatus: 'pending' | 'verified' | 'rejected';
    kycDocuments?: string[];
    rating: number;
    ratingCount: number;
    totalSales: number;
    totalRevenue: number;
    productCount: number;
    photoURL?: string;
    banner?: string;
    createdAt: string;
    updatedAt: string;
}

export type ProductCategory = 
    | 'acoustic'
    | 'electric'
    | 'classical'
    | 'bass'
    | 'ukulele'
    | 'accessories'
    | 'cases'
    | 'amplifiers'
    | 'effects'
    | 'strings'
    | 'other'

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
    acoustic: 'Guitarra Acústica',
    electric: 'Guitarra Eléctrica',
    classical: 'Guitarra Clásica',
    bass: 'Bajo',
    ukulele: 'Ukelele',
    accessories: 'Accesorios',
    cases: 'Estuches',
    amplifiers: 'Amplificadores',
    effects: 'Efectos',
    strings: 'Cuerdas',
    other: 'Otros'
}

export type Product = {
    id: string;
    sellerId: string;
    sellerName: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    sold: number;
    images: string[];
    category: ProductCategory;
    subcategory?: string;
    condition: 'new' | 'refurbished' | 'used';
    weight?: number;
    dimensions?: string;
    visible: boolean;
    rating: number;
    ratingCount: number;
    tags: string[];
    shipping: {
        included: boolean;
        weight?: number;
        dimensions?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'sold' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt'>

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type Order = {
    id: string;
    buyerId: string;
    buyerName: string;
    buyerEmail: string;
    sellerId: string;
    sellerName: string;
    productId: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    currency: string;
    status: OrderStatus;
    paymentId?: string;
    trackingNumber?: string;
    shippingAddress?: ShippingData;
    notes?: string;
    feedback?: {
        rating: number;
        comment: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type SellerStats = {
    totalSales: number;
    totalRevenue: number;
    rating: number;
    ratingCount: number;
    productCount: number;
    pendingOrders: number;
    monthlyRevenue: number;
    lastUpdated: string;
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