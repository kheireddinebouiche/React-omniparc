import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Equipment } from '../../types';

export interface EquipmentState {
  items: Equipment[];
  loading: boolean;
  error: string | null;
}

const initialState: EquipmentState = {
  items: [],
  loading: false,
  error: null,
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    setEquipment: (state, action: PayloadAction<Equipment[]>) => {
      state.items = action.payload;
    },
    addEquipment: (state, action: PayloadAction<Equipment>) => {
      state.items.push(action.payload);
    },
    updateEquipment: (state, action: PayloadAction<Equipment>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteEquipment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { setEquipment, addEquipment, updateEquipment, deleteEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer; 