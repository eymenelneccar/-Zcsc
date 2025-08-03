
import { storage } from "./storage";
import { db } from "./db";
import { transactions, transactionItems } from "@shared/schema";
import { eq } from "drizzle-orm";

async function cleanupFixedData() {
  try {
    console.log("بدء عملية تنظيف البيانات الثابتة...");
    
    const fixedCustomerId = "6eb8eb0b-be45-4a34-a8b7-468ccbdc570b";
    const fixedProductId = "ed21c0cd-16e8-42fd-a883-7732572bae1f";

    // أولاً: حذف جميع المعاملات المرتبطة بالعميل الثابت
    console.log("جاري حذف المعاملات المرتبطة بالعميل الثابت...");
    try {
      const transactions = await storage.getTransactions();
      const customerTransactions = transactions.filter(t => t.customerId === fixedCustomerId);
      
      for (const transaction of customerTransactions) {
        // حذف عناصر المعاملة أولاً
        await db.delete(transactionItems)
          .where(eq(transactionItems.transactionId, transaction.id));
        
        // ثم حذف المعاملة نفسها
        await db.delete(transactions)
          .where(eq(transactions.id, transaction.id));
        
        console.log(`تم حذف المعاملة: ${transaction.transactionNumber}`);
      }
    } catch (error) {
      console.error("خطأ في حذف المعاملات:", error);
    }

    // ثانياً: حذف العميل الثابت
    try {
      const customer = await storage.getCustomer(fixedCustomerId);
      
      if (customer) {
        await storage.deleteCustomer(fixedCustomerId);
        console.log(`تم حذف العميل: ${customer.name} (${fixedCustomerId})`);
      } else {
        console.log(`العميل بالمعرف ${fixedCustomerId} غير موجود`);
      }
    } catch (error) {
      console.error(`خطأ في حذف العميل ${fixedCustomerId}:`, error);
    }

    // ثالثاً: حذف عناصر المعاملات المرتبطة بالمنتج الثابت
    console.log("جاري حذف عناصر المعاملات المرتبطة بالمنتج الثابت...");
    try {
      await db.delete(transactionItems)
        .where(eq(transactionItems.productId, fixedProductId));
      console.log("تم حذف عناصر المعاملات المرتبطة بالمنتج");
    } catch (error) {
      console.error("خطأ في حذف عناصر المعاملات:", error);
    }

    // رابعاً: حذف المنتج الثابت
    try {
      const product = await storage.getProduct(fixedProductId);
      
      if (product) {
        await storage.deleteProduct(fixedProductId);
        console.log(`تم حذف المنتج: ${product.name} (${fixedProductId})`);
      } else {
        console.log(`المنتج بالمعرف ${fixedProductId} غير موجود`);
      }
    } catch (error) {
      console.error(`خطأ في حذف المنتج ${fixedProductId}:`, error);
    }

    console.log("تم الانتهاء من تنظيف البيانات الثابتة بنجاح!");
  } catch (error) {
    console.error("خطأ عام في تنظيف البيانات:", error);
  }
}

// تشغيل السكريبت
cleanupFixedData();
