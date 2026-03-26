'use client';

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFinanceStore } from "@/lib/store";
import { generateId, cn } from "@/lib/utils";
import { Tabungan } from "@/lib/types";
import { tabunganSchema, type TabunganFormData } from "@/lib/schemas";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ResponsiveModal } from "@/shared/ui/responsive-modal";
import NumericInput from "@/shared/forms/NumericInput";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { 
    Target, 
    PiggyBank, 
    Car, 
    Home, 
    Plane, 
    GraduationCap, 
    Laptop, 
    Smartphone,
    HeartPulse,
    CalendarIcon,
    Save
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

  const {
      register,
      control,
      handleSubmit,
      reset,
      watch,
      setValue,
      formState: { errors, isSubmitting },
  } = useForm<any>({
      resolver: zodResolver(tabunganSchema),
      defaultValues: {
          id_tabungan: "",
          nama_tujuan: "",
          target_nominal: 0,
          tanggal_target: "",
          icon: "Target",
          status: "aktif",
      },
  });

  useEffect(() => {
    if (dataToEdit) {
      reset({
        nama_tujuan: dataToEdit.nama_tujuan,
        target_nominal: dataToEdit.target_nominal,
        tanggal_target: dataToEdit.tanggal_target,
        icon: dataToEdit.icon,
      });
    }
  }, [dataToEdit, reset]);

  const selectedIcon = watch("icon");

  const onSubmit = async (data: TabunganFormData) => {
    const payload: Tabungan = {
      id_tabungan: dataToEdit?.id_tabungan || `SF-${generateId().substring(0, 6)}`,
      nama_tujuan: data.nama_tujuan,
      target_nominal: data.target_nominal,
      tanggal_target: data.tanggal_target,
      icon: data.icon,
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
    }
  };

  return (
    <ResponsiveModal
      open={true}
      onOpenChange={onClose}
      title={dataToEdit ? 'Edit Tujuan Tabungan' : 'Buat Sinking Fund Baru'}
      className="sm:max-w-md"
    >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Main Info Group */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama_tujuan" className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                Nama Tujuan Sinking Fund
              </Label>
              <Input
                id="nama_tujuan"
                placeholder="Cth: Dana Darurat, Beli Laptop, dsb."
                {...register("nama_tujuan")}
                className={cn(
                    "h-12 rounded-xl bg-white border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 font-medium",
                    errors.nama_tujuan && "border-destructive"
                )}
              />
              {errors.nama_tujuan && <p className="text-[10px] font-bold text-destructive">{(errors.nama_tujuan.message as string)}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                Estimasi Tanggal Dicapai
              </Label>
              <Controller
                  name="tanggal_target"
                  control={control}
                  render={({ field }) => (
                      <Popover>
                          <PopoverTrigger
                              className={cn(
                                  "flex h-12 w-full items-center justify-start rounded-xl border border-input bg-white px-4 py-2 text-sm font-normal transition-all outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50",
                                  !field.value && "text-muted-foreground/50",
                                  errors.tanggal_target && "border-destructive"
                              )}
                          >
                              <CalendarIcon className="mr-3 h-4 w-4 shrink-0 opacity-40" />
                              <span className="font-bold">
                                  {field.value
                                      ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                      : "Pilih tanggal target"}
                              </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-[1.5rem] shadow-2xl border-none ring-1 ring-black/5" align="start" sideOffset={8}>
                              <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => {
                                      if (date) {
                                          const year = date.getFullYear();
                                          const month = String(date.getMonth() + 1).padStart(2, '0');
                                          const day = String(date.getDate()).padStart(2, '0');
                                          field.onChange(`${year}-${month}-${day}`);
                                      }
                                  }}
                                  initialFocus
                              />
                          </PopoverContent>
                      </Popover>
                  )}
              />
              {errors.tanggal_target && <p className="text-[10px] font-bold text-destructive">{(errors.tanggal_target.message as string)}</p>}
            </div>
          </div>

          {/* Nominal Target */}
          <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30">
            <NumericInput
              label="Target Nominal Menabung"
              name="target_nominal"
              control={control}
              error={(errors.target_nominal?.message as string)}
              className="text-3xl font-black h-16 bg-white shadow-sm text-center border-indigo-200 focus:ring-indigo-200 text-indigo-900"
            />
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pilih Ikon Tabungan</Label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {ICONS.map((i) => {
                  const Icon = i.icon;
                  const isActive = selectedIcon === i.name;
                  return (
                    <button
                      key={i.name}
                      type="button"
                      onClick={() => setValue("icon", i.name)}
                      className={cn(
                        "flex items-center justify-center aspect-square rounded-2xl border transition-all duration-300",
                        isActive 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110 z-10" 
                          : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200"
                      )}
                    >
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </button>
                  );
                })}
              </div>
              {errors.icon && <p className="text-[10px] font-bold text-destructive">{(errors.icon.message as string)}</p>}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-indigo-950 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-950/20 transition-all active:scale-[0.98]"
              disabled={isSubmitting}
            >
              <Save size={18} className="mr-2 text-indigo-400" />
              {isSubmitting ? "Menyimpan..." : dataToEdit ? "Simpan Perubahan" : "Buat Sinking Fund"}
            </Button>
          </div>
        </form>
    </ResponsiveModal>
  );
}
