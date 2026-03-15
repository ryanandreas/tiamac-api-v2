"use client"

import Link from "next/link"

export default function FooterSection() {
    return (
        <footer className="bg-slate-900 pt-24 pb-12 overflow-hidden relative">
             <div className="absolute top-0 right-0 -z-0 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
             
            <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="size-10 bg-linear-to-br from-[#4d9e0f] to-[#66B21D] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                <span className="text-white font-extrabold text-sm tracking-tight">AC</span>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">Tiam AC</span>
                        </Link>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed mb-10 max-w-[240px]">
                            Solusi terpercaya untuk kenyamanan udara Anda di Jakarta dan sekitarnya. Teknisi ahli, harga jujur.
                        </p>
                        <div className="flex items-center gap-4">
                            {["FB", "IG", "TW", "YT"].map(soc => (
                                <a key={soc} href="#" className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#66B21D] hover:text-white transition-all duration-300 font-black text-xs">
                                    {soc}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8">Layanan Kami</h3>
                        <ul className="space-y-4">
                            {["Cuci AC (Maintenance)", "Perbaikan & Service", "Bongkar Pasang", "Isi Freon", "Kontrak Kerjasama"].map(link => (
                                <li key={link}>
                                    <Link href="#" className="text-slate-400 text-sm font-bold hover:text-[#66B21D] transition-colors flex items-center gap-2 group">
                                        <div className="size-1 bg-slate-700 rounded-full group-hover:bg-[#66B21D] transition-colors"></div>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8">Bantuan</h3>
                        <ul className="space-y-4">
                            {["Cara Memesan", "Jadwal Servis", "Promo Terbaru", "FAQ", "Hubungi Kami"].map(link => (
                                <li key={link}>
                                    <Link href="#" className="text-slate-400 text-sm font-bold hover:text-[#66B21D] transition-colors flex items-center gap-2 group">
                                        <div className="size-1 bg-slate-700 rounded-full group-hover:bg-[#66B21D] transition-colors"></div>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8">Kontak & Lokasi</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="text-[#66B21D] mt-1 shrink-0">📍</div>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed">
                                    LTC GLODOK, Lt. UG Blok B11 No.6 <br /> Jl. Hayam Wuruk No.127, Jakarta Barat
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="text-[#66B21D] mt-1 shrink-0">📞</div>
                                <p className="text-slate-400 text-sm font-bold">
                                    +62 812-5653-4837
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="text-[#66B21D] mt-1 shrink-0">✉️</div>
                                <p className="text-slate-400 text-sm font-bold truncate">
                                    ac.tiam2610@gmail.com
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} Tiam AC. Seluruh Hak Cipta Dilindungi.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="#" className="text-slate-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest">Syarat & Ketentuan</Link>
                        <Link href="#" className="text-slate-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-widest">Kebijakan Privasi</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
