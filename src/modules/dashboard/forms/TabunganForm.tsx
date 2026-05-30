'use client';

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFinanceStore } from "@/lib/store";
import { generateId, cn, formatRupiah } from "@/lib/utils";
import type { Tabungan } from "@/lib/types";
import { tabunganSchema, type TabunganFormData } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import FormPageLayout from "@/shared/layout/FormPageLayout";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ResponsiveModal } from "@/shared/ui/responsive-modal";
import NumericInput from "@/shared/forms/NumericInput";
import { SearchableSelect } from "@/shared/ui/SearchableSelect";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Target, PiggyBank, Car, Home, Plane, GraduationCap, Laptop, Smartphone, HeartPulse, CalendarIcon, Save, Sparkles, Wallet, Building, Loader2, CheckCircle2 } from "lucide-react";

interface TabunganFormProps {
  onClose: () => void;
  dataToEdit?: Tabungan | null;
  inline?: boolean;
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

export default function TabunganForm({ onClose, dataToEdit, inline = false }: TabunganFormProps) {
  const addTabungan = useFinanceStore((s) => s.addTabungan);
  const updateTabungan = useFinanceStore((s) => s.updateTabungan);
  const sumberDanaList = useFinanceStore((s) => s.sumberDanaList);
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
      register,
      control,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isSubmitting, isDirty },
  } = useForm<any>({
      resolver: zodResolver(tabunganSchema),
      defaultValues: {
          id_tabungan: "",
          nama_tujuan: "",
          target_nominal: 0,
          tanggal_target: "",
          icon: "Target",
          status: "aktif",
          is_external: true,
          id_nama_dompet: null,
      },
  });

  useEffect(() => {
    if (dataToEdit) {
      reset({
        nama_tujuan: dataToEdit.nama_tujuan,
        target_nominal: dataToEdit.target_nominal,
        tanggal_target: dataToEdit.tanggal_target,
        icon: dataToEdit.icon,
        is_external: dataToEdit.is_external ?? true,
        id_nama_dompet: dataToEdit.id_nama_dompet ?? null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataToEdit?.id_tabungan, reset]);

  const watchedNama = useWatch({ control, name: "nama_tujuan" }) || "";
  const watchedTarget = useWatch({ control, name: "target_nominal" }) || 0;
  const watchedTanggal = useWatch({ control, name: "tanggal_target" }) || "";
  const watchedIcon = useWatch({ control, name: "icon" }) || "Target";
  const watchedIsExternal = useWatch({ control, name: "is_external" });
  const watchedDompet = useWatch({ control, name: "id_nama_dompet" });

  const SelectedIconComponent = useMemo(() => {
    return ICONS.find(i => i.name === watchedIcon)?.icon || Target;
  }, [watchedIcon]);

  const onSubmit = async (data: TabunganFormData) => {
    const payload: Tabungan = {
      id_tabungan: dataToEdit?.id_tabungan || `SF-${generateId().substring(0, 6)}`,
      nama_tujuan: data.nama_tujuan,
      target_nominal: data.target_nominal,
      tanggal_target: data.tanggal_target,
      icon: data.icon,
      status: dataToEdit?.status || "aktif",
      tanggal_dibuat: dataToEdit?.tanggal_dibuat || new Date().toISOString().split("T")[0],
      is_external: data.is_external,
      id_nama_dompet: data.is_external ? null : data.id_nama_dompet,
    };

    try {
      if (dataToEdit) {
        await updateTabungan(payload);
      } else {
        await addTabungan(payload);
      }
      if (inline) {
        setShowSuccess(true);
      } else {
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formContent = (
    <>
      {/* Bento Item 1: Detail Identitas */}
      <div className={cn(
        "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-5 col-span-1 md:col-span-2",
        inline ? "bg-white border-slate-200 hover:border-slate-300" : "bg-slate-50/50 border-slate-100"
      )}>
        
        <div className="space-y-2">
          <Label htmlFor="nama_tujuan" className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
            Nama Tujuan Tabungan
          </Label>
          <Input
            id="nama_tujuan"
            placeholder="Cth: Pembelian Laptop, Dana Darurat, Liburan..."
            {...register("nama_tujuan")}
            className={cn(
              "h-14 rounded-2xl font-medium shadow-sm transition-all focus:scale-[1.01]",
              inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:border-primary/50 focus:ring-primary/20 focus:bg-white" : "bg-white border-slate-200 text-slate-950 focus:border-primary/50 focus:ring-primary/20",
              errors.nama_tujuan && "border-destructive"
            )}
          />
          {errors.nama_tujuan && <p className="text-xs font-semibold text-destructive mt-1">{(errors.nama_tujuan.message as string)}</p>}
        </div>

        <div className="space-y-2">
          <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
            Estimasi Tanggal Pencapaian
          </Label>
          <Controller
              name="tanggal_target"
              control={control}
              render={({ field }) => (
                  <Popover>
                      <PopoverTrigger
                          className={cn(
                              "flex h-14 w-full items-center justify-start rounded-2xl border px-4 py-2 text-sm font-medium transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.01]",
                              inline ? "bg-slate-50 border-slate-200 text-slate-950 focus:border-primary/50 focus:ring-primary/20 focus:bg-white" : "bg-white border-slate-200 text-slate-950 focus:border-primary/50 focus:ring-primary/20",
                              !field.value && "text-muted-foreground/50",
                              errors.tanggal_target && "border-destructive"
                          )}
                      >
                          <CalendarIcon className="mr-3 h-4 w-4 shrink-0 opacity-40 text-slate-500" />
                          <span className="font-bold text-slate-900">
                              {field.value
                                  ? new Date(field.value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                                  : "Pilih tanggal target"}
                          </span>
                      </PopoverTrigger>
                      <PopoverContent className={cn("w-auto p-0 rounded-[1.5rem] shadow-2xl border-none ring-1 ring-black/5 bg-white text-slate-950")} align="start" sideOffset={8}>
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
          {errors.tanggal_target && <p className="text-xs font-semibold text-destructive mt-1">{(errors.tanggal_target.message as string)}</p>}
        </div>
      </div>

      {/* Bento Item 2: Nominal Target (NumericInput) */}
      <div className={cn(
        "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
        inline ? "bg-white border-slate-200" : "bg-lime-50/20 border-lime-100"
      )}>
        <NumericInput
          label="Target Nominal Rencana Tabungan"
          name="target_nominal"
          control={control as any}
          error={(errors.target_nominal?.message as string)}
          className={cn(
            "text-3xl sm:text-4xl font-black h-16 sm:h-20 shadow-sm text-center tracking-tight",
            inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary/50 focus:ring-primary/20 focus:bg-white" : "bg-primary/5 border-primary/20 text-primary"
          )}
        />
      </div>

      {/* Bento Item 3: Pemilih Ikon (Col Span 2) */}
      <div className={cn(
        "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-4 col-span-1 md:col-span-2",
        inline ? "bg-white border-slate-200" : "bg-white border-slate-100"
      )}>
          <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
              Pilih Representasi Visual (Ikon)
          </Label>
          <div className="grid grid-cols-5 gap-3 pt-1">
            {ICONS.map((i) => {
              const Icon = i.icon;
              const isActive = watchedIcon === i.name;
              return (
                <button
                  key={i.name}
                  type="button"
                  onClick={() => setValue("icon", i.name)}
                  className={cn(
                    "flex items-center justify-center aspect-square rounded-2xl border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
                    isActive 
                      ? (inline ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-primary border-primary text-primary-foreground shadow-lg") 
                      : (inline ? "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-100" : "bg-slate-50 border-slate-155 text-slate-400 hover:bg-slate-100")
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
          </div>
          {errors.icon && <p className="text-xs font-semibold text-destructive mt-1">{(errors.icon.message as string)}</p>}
      </div>

      {/* Bento Item 4: Lokasi Penyimpanan Dana */}
      <div className={cn(
        "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden shadow-sm flex flex-col gap-5 col-span-1 md:col-span-2",
        inline ? "bg-white border-slate-200" : "bg-white border-slate-100"
      )}>
          <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
              Lokasi Penyimpanan Tabungan
          </Label>
          <div className="grid grid-cols-2 gap-3">
              <button
                  type="button"
                  onClick={() => setValue("is_external", true)}
                  className={cn(
                      "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-95",
                      watchedIsExternal 
                          ? (inline ? "bg-blue-50 border-blue-500 text-blue-600 ring-2 ring-blue-500/20" : "bg-primary/10 border-primary text-primary") 
                          : (inline ? "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100" : "bg-slate-50 border-slate-200 text-slate-400")
                  )}
              >
                  <Building size={20} strokeWidth={watchedIsExternal ? 2.5 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Eksternal</span>
                  <span className="text-[8px] font-semibold text-center opacity-80 leading-tight px-2">Di luar aplikasi (Bank lain, Reksadana, dsb)</span>
              </button>
              <button
                  type="button"
                  onClick={() => setValue("is_external", false)}
                  className={cn(
                      "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-95",
                      !watchedIsExternal 
                          ? (inline ? "bg-emerald-50 border-emerald-500 text-emerald-600 ring-2 ring-emerald-500/20" : "bg-primary/10 border-primary text-primary") 
                          : (inline ? "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100" : "bg-slate-50 border-slate-200 text-slate-400")
                  )}
              >
                  <Wallet size={20} strokeWidth={!watchedIsExternal ? 2.5 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Internal</span>
                  <span className="text-[8px] font-semibold text-center opacity-80 leading-tight px-2">Disimpan di salah satu dompet di aplikasi</span>
              </button>
          </div>
          
          {!watchedIsExternal && (
              <div className="space-y-2 mt-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <Label className={cn("text-[10px] font-black uppercase tracking-[0.25em]", inline ? "text-slate-500" : "text-slate-500")}>
                      Pilih Dompet / Sumber Dana
                  </Label>
                  <SearchableSelect
                      options={sumberDanaList.map(s => ({
                          value: s.id_sumber_dana,
                          label: s.nama_sumber
                      }))}
                      value={watchedDompet || ""}
                      onValueChange={(val) => setValue('id_nama_dompet', val)}
                      placeholder="Pilih dompet tempat dana disimpan..."
                      className={cn("rounded-xl h-12", inline ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-white border-slate-200")}
                  />
                  {errors.id_nama_dompet && <p className="text-xs font-semibold text-destructive mt-1">Pilih dompet internal terlebih dahulu.</p>}
              </div>
          )}
      </div>

      {/* Action Row */}
      <div className="col-span-1 md:col-span-2 flex justify-end pt-4 w-full">
          <Button
              type="submit"
              disabled={isSubmitting || showSuccess}
              className={cn(
                  "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] border-none",
                  inline ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
          >
              {showSuccess ? (
                  <>
                      <CheckCircle2 size={16} className="animate-in zoom-in mr-2" />
                      Berhasil Disimpan!
                  </>
              ) : isSubmitting ? (
                  <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Menyimpan...
                  </>
              ) : (
                  <>
                      <Save size={16} className="mr-2" />
                      {isSubmitting ? "Menyimpan..." : dataToEdit ? "Simpan Perubahan" : "Buat Sinking Fund"}
                  </>
              )}
          </Button>
      </div>
    </>
  );

  const previewContent = (
    <div className="w-full flex flex-col gap-8 text-center items-center">
      {/* 3D Holographic Progress Circle Preview */}
      <div className="relative w-full aspect-square max-w-[280px] rounded-[2.5rem] p-6 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-[50px] opacity-35 group-hover:bg-emerald-500/20 transition-all duration-1000" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-emerald-400/10 blur-[50px] opacity-25" />

        {/* Central interactive icon display */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-pulse shadow-xs">
            <SelectedIconComponent size={36} strokeWidth={2} />
        </div>

        <div className="relative z-10">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">TARGET TABUNGAN</span>
          <h4 className="text-md font-black text-slate-800 mt-1 max-w-[200px] truncate uppercase tracking-wider">{watchedNama || 'TABUNGAN BARU'}</h4>
          
          <div className="w-24 h-0.5 bg-slate-200 mx-auto my-3 rounded-full" />
          
          <p className="text-xl font-black text-emerald-600 tracking-tight display-number">{formatRupiah(watchedTarget)}</p>
          
          {watchedTanggal && (
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-450 mt-2">
              EST. {new Date(watchedTanggal).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Ring decoration */}
        <div className="absolute inset-4 rounded-[2rem] border border-slate-100 pointer-events-none" />
      </div>

      {/* Smart Tip */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-left w-full">
        <div className="flex items-center gap-2 mb-2 text-emerald-600">
            <Sparkles size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sinking Fund Method</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-650 leading-relaxed">
            Metode menabung Sinking Fund membantu Anda mempersiapkan biaya masa depan yang pasti terjadi (seperti liburan, pajak, ganti gadget) dengan cara mengalokasikan sejumlah dana kecil secara teratur.
        </p>
      </div>
    </div>
  );

  if (inline) {
    return (
      <FormPageLayout
        title={dataToEdit ? 'Edit Sinking Fund' : 'Sinking Fund Baru'}
        description={dataToEdit ? 'Perbarui informasi dan target pencapaian tabungan Anda' : 'Rencanakan pos tabungan berjangka khusus untuk berbagai tujuan finansial'}
        isDirty={isDirty}
        previewPanel={previewContent}
        formPanel={
          <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-16">
            {formContent}
          </form>
        }
        onCancel={onClose}
        showSuccessModal={showSuccess}
        onSuccessConfirm={() => router.push('/tabungan')}
        successMessage={`Sinking Fund "${watchedNama}" dengan target nominal ${formatRupiah(watchedTarget)} berhasil disimpan.`}
      />
    );
  }

  return (
    <ResponsiveModal
      open={true}
      onOpenChange={onClose}
      title={dataToEdit ? 'Edit Tujuan Tabungan' : 'Buat Sinking Fund Baru'}
      className="sm:max-w-md bg-white border-slate-100 text-slate-950"
    >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {formContent}
        </form>
    </ResponsiveModal>
  );
}
