import { create } from 'zustand';
import { Customer, App, Code, Sale, SaleItem } from '../types';
import { validateCodes } from '../lib/codeManagement';
import * as customerService from '../services/customer.service';
import * as appService from '../services/app.service';
import * as saleService from '../services/sale.service';
import * as db from '../lib/database';

interface Store {
  initialized: boolean;
  customers: Customer[];
  apps: App[];
  codes: Code[];
  sales: Sale[];
  initialize: () => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addApp: (app: Omit<App, 'id' | 'codesAvailable'>) => Promise<void>;
  updateApp: (id: string, app: Partial<App>) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  addCodes: (
    appId: string, 
    newCodes: string[], 
    onProgress: (progress: number) => void
  ) => Promise<{
    validCodes: string[];
    duplicates: string[];
    systemDuplicates: string[];
  }>;
  addSale: (
    customerId: string, 
    items: Omit<SaleItem, 'codes'>[],
    paymentId?: string
  ) => Promise<boolean>;
  confirmSale: (saleId: string) => Promise<void>;
  updateSale: (id: string, updates: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  initialized: false,
  customers: [],
  apps: [],
  codes: [],
  sales: [],

  initialize: async () => {
    try {
      await db.initializeDatabase();
      const [customers, apps, codes, sales] = await Promise.all([
        customerService.getCustomers(),
        appService.getApps(),
        db.getCodes(),
        saleService.getSales()
      ]);

      set({
        initialized: true,
        customers,
        apps,
        codes,
        sales
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      throw error;
    }
  },

  addCustomer: async (customer) => {
    try {
      const newCustomer = await customerService.createCustomer(customer);
      set(state => ({
        customers: [...state.customers, newCustomer]
      }));
    } catch (error) {
      console.error('Failed to add customer:', error);
      throw error;
    }
  },

  updateCustomer: async (id, customer) => {
    try {
      const updatedCustomer = await customerService.updateCustomer(id, customer);
      set(state => ({
        customers: state.customers.map(c => 
          c.id === id ? updatedCustomer : c
        )
      }));
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await customerService.deleteCustomer(id);
      set(state => ({
        customers: state.customers.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  },

  addApp: async (app) => {
    try {
      const newApp = await appService.createApp(app);
      set(state => ({
        apps: [...state.apps, newApp]
      }));
    } catch (error) {
      console.error('Failed to add app:', error);
      throw error;
    }
  },

  updateApp: async (id, app) => {
    try {
      const updatedApp = await appService.updateApp(id, app);
      set(state => ({
        apps: state.apps.map(a => 
          a.id === id ? updatedApp : a
        )
      }));
    } catch (error) {
      console.error('Failed to update app:', error);
      throw error;
    }
  },

  deleteApp: async (id) => {
    try {
      await appService.deleteApp(id);
      set(state => ({
        apps: state.apps.filter(a => a.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete app:', error);
      throw error;
    }
  },

  addCodes: async (appId, newCodes, onProgress) => {
    try {
      const existingCodes = get().codes;
      const validation = validateCodes(newCodes, existingCodes);

      if (validation.validCodes.length > 0) {
        const codesToAdd = validation.validCodes.map(code => ({
          app_id: appId,
          code,
          used: false
        }));

        const addedCodes = await db.addCodes(codesToAdd);
        
        set(state => ({
          codes: [...state.codes, ...addedCodes],
          apps: state.apps.map(app => 
            app.id === appId 
              ? { ...app, codesAvailable: app.codesAvailable + addedCodes.length }
              : app
          )
        }));
      }

      return validation;
    } catch (error) {
      console.error('Failed to add codes:', error);
      throw error;
    }
  },

  addSale: async (customerId, items, paymentId) => {
    try {
      const sale = {
        customerId,
        items,
        totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
        date: new Date().toISOString(),
        status: 'pending' as const,
        paymentId,
        paymentStatus: 'pending'
      };

      const newSale = await saleService.createSale(sale);

      set(state => ({
        sales: [newSale, ...state.sales]
      }));

      return true;
    } catch (error) {
      console.error('Failed to process sale:', error);
      return false;
    }
  },

  confirmSale: async (saleId) => {
    try {
      const confirmedSale = await saleService.confirmSale(saleId);
      set(state => ({
        sales: state.sales.map(sale => 
          sale.id === saleId ? confirmedSale : sale
        ),
        apps: state.apps.map(app => {
          const saleItems = confirmedSale.items.filter(item => item.appId === app.id);
          const usedCodes = saleItems.reduce((total, item) => total + item.quantity, 0);
          return {
            ...app,
            codesAvailable: app.codesAvailable - usedCodes
          };
        })
      }));
    } catch (error) {
      console.error('Failed to confirm sale:', error);
      throw error;
    }
  },

  updateSale: async (id, updates) => {
    try {
      const updatedSale = await saleService.updateSale(id, updates);
      set(state => ({
        sales: state.sales.map(sale => 
          sale.id === id ? updatedSale : sale
        )
      }));
    } catch (error) {
      console.error('Failed to update sale:', error);
      throw error;
    }
  },

  deleteSale: async (id) => {
    try {
      await saleService.deleteSale(id);
      set(state => ({
        sales: state.sales.filter(sale => sale.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete sale:', error);
      throw error;
    }
  }
}));