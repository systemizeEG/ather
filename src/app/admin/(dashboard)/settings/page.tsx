import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateSettings } from "@/app/actions/admin";
import { Save } from "lucide-react";

export default async function AdminSettingsPage() {
  const settings = await prisma.settings.findFirst();

  const handleUpdate = async (formData: FormData) => {
    "use server";
    const data = {
      instapayAccount: formData.get("instapayAccount"),
      instapayReceiverName: formData.get("instapayReceiverName"),
      whatsappNumber: formData.get("whatsappNumber"),
      storeName: formData.get("storeName"),
      supportText: formData.get("supportText")
    };
    await updateSettings(data);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold mb-2">إعدادات المتجر</h1>
        <p className="text-muted-foreground">قم بإعداد بيانات الدفع الخاصة بـ InstaPay وأرقام التواصل.</p>
      </div>

      <form action={handleUpdate} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold">بوابة الدفع (InstaPay)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">عنوان InstaPay (IPA)</label>
              <Input 
                name="instapayAccount" 
                defaultValue={settings?.instapayAccount || ""} 
                placeholder="example@instapay" 
                dir="ltr"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">العنوان الذي سيرسل إليه العملاء أموالهم.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">اسم المستلم (للتأكيد)</label>
              <Input 
                name="instapayReceiverName" 
                defaultValue={settings?.instapayReceiverName || ""} 
                placeholder="أحمد محمد" 
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-4">
          <h2 className="text-xl font-bold">التواصل والدعم</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">رقم الواتساب لاستقبال الطلبات</label>
            <Input 
              name="whatsappNumber" 
              defaultValue={settings?.whatsappNumber || ""} 
              placeholder="+201xxxxxxxxx" 
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground mt-1">يجب أن يتضمن رمز الدولة، مثل +20 لمصر.</p>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" size="lg" variant="glow">
            <Save className="w-5 h-5 ml-2" /> حفظ الإعدادات
          </Button>
        </div>
      </form>
    </div>
  );
}
