import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { SyncOperation } from '../hooks/useOfflineSync';
import { ProductSchema } from '../types/Product';

export class SyncService {
  static async syncOperation(operation: SyncOperation) {
    switch (operation.type) {
      case 'CREATE':
        return await this.syncCreate(operation);
      case 'UPDATE':
        return await this.syncUpdate(operation);
      case 'DELETE':
        return await this.syncDelete(operation);
      default:
        throw new Error(`Tipo de operação não suportada: ${operation.type}`);
    }
  }

  private static async syncCreate(operation: SyncOperation) {
    const { collection: collectionName, data } = operation;
    
    // Validar dados com Zod se for produto
    if (collectionName === 'products') {
      ProductSchema.parse(data);
    }

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      _synced: true,
      _createdAt: new Date(),
      _updatedAt: new Date()
    });

    return docRef.id;
  }

  private static async syncUpdate(operation: SyncOperation) {
    const { collection: collectionName, data } = operation;
    
    if (!data.id) {
      throw new Error('ID é obrigatório para atualização');
    }

    // Validar dados com Zod se for produto
    if (collectionName === 'products') {
      ProductSchema.parse(data);
    }

    const docRef = doc(db, collectionName, data.id);
    await updateDoc(docRef, {
      ...data,
      _synced: true,
      _updatedAt: new Date()
    });
  }

  private static async syncDelete(operation: SyncOperation) {
    const { collection: collectionName, data } = operation;
    
    if (!data.id) {
      throw new Error('ID é obrigatório para exclusão');
    }

    const docRef = doc(db, collectionName, data.id);
    await deleteDoc(docRef);
  }

  static async syncMultipleOperations(operations: SyncOperation[]) {
    const batch = writeBatch(db);
    
    for (const operation of operations) {
      switch (operation.type) {
        case 'CREATE':
          const newDocRef = doc(collection(db, operation.collection));
          batch.set(newDocRef, {
            ...operation.data,
            _synced: true,
            _createdAt: new Date(),
            _updatedAt: new Date()
          });
          break;
        
        case 'UPDATE':
          const updateDocRef = doc(db, operation.collection, operation.data.id);
          batch.update(updateDocRef, {
            ...operation.data,
            _synced: true,
            _updatedAt: new Date()
          });
          break;
        
        case 'DELETE':
          const deleteDocRef = doc(db, operation.collection, operation.data.id);
          batch.delete(deleteDocRef);
          break;
      }
    }
    
    await batch.commit();
  }
}

export const syncOperation = SyncService.syncOperation.bind(SyncService);
export const syncMultipleOperations = SyncService.syncMultipleOperations.bind(SyncService);