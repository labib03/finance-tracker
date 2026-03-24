import { useState, useEffect } from "react";
import { useFinanceStore } from "@/lib/store";
import { generateId, cn } from "@/lib/utils";
import { Tabungan } from "@/lib/types";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { 
    Target, 
    PiggyBank, 
    Car, 
    Home, 
    Plane, 
    GraduationCap, 
    Laptop, 
    Smartphone,
    HeartPulse
} from "lucide-react";

interface TabunganFormProps {
  onClose: () => void;
  dataToEdit?: Tabungan | null;
}

const ICONS = [
  { name: "Target", icon: Target },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "Car", icon: Car },
  { name: "Home", icon: Home },
  { name: "Plane", icon: Plane },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Laptop", icon: Laptop },
  { name: "Smartphone", icon: Smartphone },
  { name: "HeartPulse", icon: HeartPulse },
];

export default function TabunganForm({ onClose, dataToEdit }: TabunganFormProps) {
  const addTabungan = useFinanceStore((s) => s.addTabungan);
  const updateTabungan = useFinanceStore((s) => s.updateTabungan);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_tujuan: "",
    target_nominal: "",
    tanggal_target: "",
    icon: "Target",
  });

  useEffect(() => {
    if (dataToEdit) {
      setFormData({
        nama_tujuan: dataToEdit.nama_tujuan,
        target_nominal: dataToEdit.target_nominal.toString(),
        tanggal_target: dataToEdit.tanggal_target,
        icon: dataToEdit.icon,
      });
    }
  }, [dataToEdit]);

  const rawTargetNominal = formData.target_nominal.replace(/\D/g, "");

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, "");
    if (val === "") {
        setFormData({ ...formData, target_nominal: "" });
        return;
    }
    // Format with thousand separators for display
    const formatted = parseInt(val, 10).toLocaleString("id-ID");
    setFormData({ ...formData, target_nominal: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const targetNominal = parseFloat(rawTargetNominal);

    if (!formData.nama_tujuan || !targetNominal || !formData.tanggal_target) {
        setIsLoading(false);
        return;
    }

    const payload: Tabungan = {
      id_tabungan: dataToEdit?.id_tabungan || `SF-${generateId().substring(0, 6)}`,
      nama_tujuan: formData.nama_tujuan,
      target_nominal: targetNominal,
      tanggal_target: formData.tanggal_target,
      icon: formData.icon,
      status: dataToEdit?.status || "aktif",
      tanggal_dibuat: dataToEdit?.tanggal_dibuat || new Date().toISOString().split("T")[0],
    };

    try {
      if (dataToEdit) {
        await updateTabungan(payload);
      } else {
        await addTabungan(payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="mb-2">
          <DialogTitle>
            {dataToEdit ? 'Edit Tujuan Tabungan' : 'Buat Sinking Fund Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Nama Tujuan Sinking Fund
            </Label>
            <Input
              placeholder="Cth: Dana Darurat, Beli Laptop, dsb."
              value={formData.nama_tujuan}
              onChange={(e) => setFormData({ ...formData, nama_tujuan: e.target.value })}
              required
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-indigo-100 focus:border-indigo-400 font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Target Nominal (Rp)
            </Label>
            <Input
              inputMode="numeric"
              placeholder="0"
              value={formData.target_nominal}
              onChange={handleNominalChange}
              required
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-indigo-100 focus:border-indigo-400 font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Tanggal Target Dicapai
            </Label>
            <Input
              type="date"
              value={formData.tanggal_target}
              onChange={(e) => setFormData({ ...formData, tanggal_target: e.target.value })}
              required
              className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-indigo-100 focus:border-indigo-400 font-medium text-slate-900 block w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Ikon Tujuan
            </Label>
            <Select
              value={formData.icon || "Target"}
              onValueChange={(val) => setFormData({ ...formData, icon: val as string })}
            >
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-indigo-100 focus:border-indigo-400 font-medium text-slate-900 shadow-none">
                <SelectValue placeholder="Pilih Ikon" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {ICONS.map((i) => {
                  const IconComp = i.icon;
                  return (
                    <SelectItem key={i.name} value={i.name} className="py-3 px-4 font-bold rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <IconComp size={18} />
                        </div>
                        {i.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-indigo-600/20 shadow-xl transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : dataToEdit ? "Update Tujuan" : "Buat Tujuan Sinking Fund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
