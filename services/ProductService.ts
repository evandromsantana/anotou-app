import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, ProductSchema } from '../types/Product';

export class ProductService {
  private static readonly COLLECTION = 'products';

  static async scanProduct(barcode: string): Promise<Product> {
    try {
      // Primeiro verifica se o produto já existe
      const q = query(
        collection(db, this.COLLECTION),
        where('barcode', '==', barcode)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const productData = doc.data();
        
        // Atualiza o contador de scans
        await updateDoc(doc.ref, {
          scannedCount: (productData.scannedCount || 0) + 1,
          scannedAt: new Date().toISOString(),
          _updatedAt: new Date()
        });

        const product = ProductSchema.parse({
          id: doc.id,
          ...productData,
          scannedCount: (productData.scannedCount || 0) + 1,
        });
        return product;
      }

      // Se não existe, busca na API externa ou cria um novo
      const productData = await this.fetchProductFromAPI(barcode);
      
      const newProduct = {
        ...productData,
        barcode,
        scannedAt: new Date().toISOString(),
        scannedCount: 1,
        _synced: true,
        _createdAt: new Date(),
        _updatedAt: new Date()
      };

      const validatedProduct = ProductSchema.parse(newProduct);
      const docRef = await addDoc(collection(db, this.COLLECTION), validatedProduct);
      
      return {
        ...validatedProduct,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error scanning product:', error);
      throw error;
    }
  }

  static async fetchProductFromAPI(barcode: string): Promise<Partial<Product>> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        return {
          name: data.product.product_name || 'Produto não identificado',
          brand: data.product.brands || '',
          image: data.product.image_url || '',
          category: data.product.categories || '',
        };
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
    }

    return {
      name: 'Produto não encontrado',
      barcode,
    };
  }

  static async getProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('scannedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        ProductSchema.parse({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      return ProductSchema.parse({
        id: docSnap.id,
        ...docSnap.data()
      });
    } catch (error) {
      console.error('Error getting product by ID:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    try {
      const validatedData = ProductSchema.partial().parse(data);
      const docRef = doc(db, this.COLLECTION, id);
      
      await updateDoc(docRef, {
        ...validatedData,
        _updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async searchProducts(term: string): Promise<Product[]> {
    try {
      if (!term.trim()) {
        return this.getProducts();
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('name', '>=', term),
        where('name', '<=', term + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        ProductSchema.parse({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  static async getProductsByBrand(brand: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('brand', '==', brand),
        orderBy('scannedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        ProductSchema.parse({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      console.error('Error getting products by brand:', error);
      throw error;
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('category', '==', category),
        orderBy('scannedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        ProductSchema.parse({
          id: doc.id,
          ...doc.data()
        })
      );
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const products = await this.getProducts();
      
      const totalScans = products.reduce((sum, product) => sum + (product.scannedCount || 1), 0);
      const uniqueProducts = products.length;
      const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
      const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
      
      const recentScans = products
        .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
        .slice(0, 5);

      return {
        totalScans,
        uniqueProducts,
        brandsCount: brands.length,
        categoriesCount: categories.length,
        recentScans
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Listener em tempo real para produtos
  static subscribeToProducts(
    callback: (products: Product[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('scannedAt', 'desc')
    );
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const products = querySnapshot.docs.map(doc => {
          try {
            return ProductSchema.parse({
              id: doc.id,
              ...doc.data()
            });
          } catch (error) {
            console.error('Error parsing product:', error);
            return null;
          }
        }).filter(Boolean) as Product[];
        
        callback(products);
      },
      (error) => {
        console.error('Error in products listener:', error);
      }
    );
  }

  // Listener para um produto específico
  static subscribeToProduct(
    productId: string,
    callback: (product: Product | null) => void
  ): Unsubscribe {
    const docRef = doc(db, this.COLLECTION, productId);
    
    return onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          try {
            const product = ProductSchema.parse({
              id: docSnap.id,
              ...docSnap.data()
            });
            callback(product);
          } catch (error) {
            console.error('Error parsing product:', error);
            callback(null);
          }
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in product listener:', error);
        callback(null);
      }
    );
  }
}