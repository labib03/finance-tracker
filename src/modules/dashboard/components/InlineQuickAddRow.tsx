'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store';
import { TableRow, TableCell } from '@/shared/ui/table';
import { SearchableSelect } from '@/shared/ui/SearchableSelect';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { getToday, formatTanggalPendek } from '@/lib/utils';
import { Save, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface InlineQuickAddRowProps {
    defaultDate: string;
    defaultCategory: string;
    defaultAccount: string;
    defaultType: string;
}

export default function InlineQuickAddRow({
    defaultDate,
    defaultCategory,
    defaultAccount,
    defaultType,
}: InlineQuickAddRowProps) {
    const addTransaksi = useFinanceStore(s => s.addTransaksi);
    const kategoriList = useFinanceStore(s => s.kategoriList);
    const sumberDanaList = useFinanceStore(s => s.sumberDanaList);

    const [isAdding, setIsAdding] = useState(false);
    
    // Determine initial type. If typeFilter is not 'Pemasukan' or 'Pengeluaran', default to 'Pengeluaran'
    const initialType = (defaultType === 'Pemasukan' || defaultType === 'Pengeluaran') 
        ? defaultType 
        : 'Pengeluaran';

    const [jenis, setJenis] = useState<'Pengeluaran'|'Pemasukan'>(initialType);
    const [tanggal, setTanggal] = useState(defaultDate !== 'all' ? defaultDate : getToday());
    const [idKategori, setIdKategori] = useState(defaultCategory !== 'all' ? defaultCategory : '');
    const [idSumberDana, setIdSumberDana] = useState(defaultAccount !== 'all' ? defaultAccount : '');
    const [label, setLabel] = useState('');
    const [nominal, setNominal] = useState('');

    const filteredKategori = kategoriList.filter(k => k.tipe === jenis);

    const handleSave = async () => {
        if (!idKategori || !idSumberDana || !nominal || isNaN(Number(nominal))) return;
        
        await addTransaksi({
            jenis,
            tanggal,
            id_kategori: idKategori,
            id_sumber_dana: idSumberDana,
            label: label || (filteredKategori.find(k => k.id_kategori === idKategori)?.nama_kategori || ''),
            nominal: Number(nominal),
            catatan: '',
            is_titipan: null
        });

        // Reset fields that are not part of default filters
        setLabel('');
        setNominal('');
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <TableRow className="hidden md:table-row group hover:bg-muted/10 border-b border-border/20">
                <TableCell colSpan={7} className="px-8 py-3">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            // Re-sync with default props when opening
                            setJenis(initialType);
                            setTanggal(defaultDate !== 'all' ? defaultDate : getToday());
                            setIdKategori(defaultCategory !== 'all' ? defaultCategory : '');
                            setIdSumberDana(defaultAccount !== 'all' ? defaultAccount : '');
                            setIsAdding(true);
                        }}
                        className="w-full border border-dashed border-border/40 text-muted-foreground hover:text-foreground rounded-xl"
                    >
                        <Plus size={14} className="mr-2" />
                        Tambah Cepat
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow className="hidden md:table-row bg-muted/5 border-b border-border/20">
            <TableCell className="px-4 py-3">
                <Select value={jenis} onValueChange={(val: any) => {
                    setJenis(val);
                    setIdKategori(''); // reset category on type change
                }}>
                    <SelectTrigger className="h-9 w-[100px] text-[10px] font-black uppercase tracking-widest rounded-xl bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pengeluaran" className="text-[10px] font-black text-rose-600">PENGELUARAN</SelectItem>
                        <SelectItem value="Pemasukan" className="text-[10px] font-black text-emerald-600">PEMASUKAN</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="px-4 py-3">
                <SearchableSelect
                    options={filteredKategori.map(k => ({ value: k.id_kategori, label: k.nama_kategori }))}
                    value={idKategori}
                    onValueChange={setIdKategori}
                    placeholder="Pilih Kategori"
                    className="h-9 w-[140px] text-[10px] bg-white rounded-xl"
                />
            </TableCell>
            <TableCell className="px-4 py-3">
                <SearchableSelect
                    options={sumberDanaList.map(s => ({ value: s.id_sumber_dana, label: s.nama_sumber }))}
                    value={idSumberDana}
                    onValueChange={setIdSumberDana}
                    placeholder="Pilih Akun"
                    className="h-9 w-[140px] text-[10px] bg-white rounded-xl"
                />
            </TableCell>
            <TableCell className="px-4 py-3">
                <Input 
                    placeholder="Judul / Keterangan"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-white w-full min-w-[120px]"
                />
            </TableCell>
            <TableCell className="px-4 py-3 text-right">
                <Input 
                    type="number"
                    placeholder="0"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="h-9 text-xs font-black rounded-xl bg-white w-[120px] text-right ml-auto"
                />
            </TableCell>
            <TableCell className="px-4 py-3 text-right">
                <Input 
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-white w-[120px] ml-auto"
                />
            </TableCell>
            <TableCell className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button 
                        size="icon-sm" 
                        variant="ghost" 
                        onClick={() => setIsAdding(false)}
                        className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600 rounded-lg w-8 h-8"
                    >
                        <X size={14} />
                    </Button>
                    <Button 
                        size="icon-sm" 
                        onClick={handleSave}
                        disabled={!idKategori || !idSumberDana || !nominal}
                        className="rounded-lg w-8 h-8"
                    >
                        <Save size={14} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
