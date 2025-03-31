import { create } from 'zustand';

interface UserInputState {
  // Single global input values object
  inputs: Record<string, any>;
  
  // Actions
  setInputValues: (values: Record<string, any>) => void;
  updateInputValues: (values: Record<string, any>) => void;
  resetInputValues: () => void;
}

export const useUserInputStore = create<UserInputState>((set) => ({
  inputs: {},
  
  // Set the entire inputs object
  setInputValues: (values) => set({ inputs: values }),
  
  // Update specific values (merge with existing)
  updateInputValues: (values) => set((state) => ({
    inputs: {
      ...state.inputs,
      ...values
    }
  })),
  
  // Reset all values
  resetInputValues: () => set({ inputs: {} })
}));