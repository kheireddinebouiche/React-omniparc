import { Timestamp } from 'firebase/firestore';

export const serializeTimestamp = (timestamp: Timestamp | null | undefined): string | null => {
  if (!timestamp) return null;
  return timestamp.toDate().toISOString();
};

export const deserializeTimestamp = (isoString: string | null | undefined): Timestamp | null => {
  if (!isoString) return null;
  return Timestamp.fromDate(new Date(isoString));
};

type SerializableValue = string | number | boolean | null | undefined | SerializableObject | SerializableArray;
interface SerializableObject {
  [key: string]: SerializableValue;
}
type SerializableArray = SerializableValue[];

export const serializeFirestoreData = <T extends SerializableObject>(data: T): T => {
  const serialized = { ...data } as T;
  
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    if (value instanceof Timestamp) {
      (serialized as any)[key] = serializeTimestamp(value);
    } else if (Array.isArray(value)) {
      (serialized as any)[key] = value.map(item => 
        item instanceof Timestamp ? serializeTimestamp(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      (serialized as any)[key] = serializeFirestoreData(value as SerializableObject);
    }
  });
  
  return serialized;
};

export const deserializeFirestoreData = <T extends SerializableObject>(data: T): T => {
  const deserialized = { ...data } as T;
  
  Object.keys(deserialized).forEach(key => {
    const value = deserialized[key];
    if (typeof value === 'string' && key.toLowerCase().includes('date')) {
      (deserialized as any)[key] = deserializeTimestamp(value);
    } else if (Array.isArray(value)) {
      (deserialized as any)[key] = value.map(item => 
        typeof item === 'string' && item.match(/^\d{4}-\d{2}-\d{2}T/) 
          ? deserializeTimestamp(item) 
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      (deserialized as any)[key] = deserializeFirestoreData(value as SerializableObject);
    }
  });
  
  return deserialized;
}; 