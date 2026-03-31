"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function FooterSection() {
    return (
        <footer className="bg-slate-50 pt-24 pb-12 overflow-hidden relative">
             <div className="absolute top-0 right-0 -z-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
             
            <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-8">
                            <Image 
                                src="/images/logo.png" 
                                alt="Tiam AC Logo" 
                                width={40} 
                                height={40} 
                                className="h-10 w-auto object-contain"
                            />
                            <span className="text-2xl font-black text-slate-900 tracking-tight">AC Tiam</span>
                        </Link>
                        <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 max-w-[240px]">
                            Solusi terpercaya untuk kenyamanan udara Anda di Jakarta dan sekitarnya. Teknisi ahli, harga jujur.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { Icon: Facebook, href: "#" },
                                { Icon: Instagram, href: "#" },
                                { Icon: Twitter, href: "#" },
                                { Icon: Youtube, href: "#" },
                            ].map((soc, i) => (
                                <a key={i} href={soc.href} className="size-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:bg-[#66B21D] hover:text-white transition-all duration-300">
                                    <soc.Icon className="size-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Layanan Kami</h3>
                        <ul className="space-y-4">
                            {["Cuci AC (Maintenance)", "Perbaikan & Service", "Bongkar Pasang", "Isi Freon", "Kontrak Kerjasama"].map(link => (
                                <li key={link}>
                                    <Link href="#" className="text-slate-500 text-sm font-bold hover:text-[#66B21D] transition-colors flex items-center gap-2 group">
                                        <div className="size-1 bg-slate-200 rounded-full group-hover:bg-[#66B21D] transition-colors"></div>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Bantuan</h3>
                        <ul className="space-y-4">
                            {["Cara Memesan", "Jadwal Servis", "Promo Terbaru", "FAQ", "Hubungi Kami"].map(link => (
                                <li key={link}>
                                    <Link href="#" className="text-slate-500 text-sm font-bold hover:text-[#66B21D] transition-colors flex items-center gap-2 group">
                                        <div className="size-1 bg-slate-200 rounded-full group-hover:bg-[#66B21D] transition-colors"></div>
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-8">Kontak & Lokasi</h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="text-[#66B21D] mt-1 shrink-0">
                                    <MapPin className="size-5" />
                                </div>
                                <p className="text-slate-600 text-sm font-bold leading-relaxed">
                                    LTC GLODOK, Lt. UG Blok B11 No.6 <br /> Jl. Hayam Wuruk No.127, Jakarta Barat
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="text-[#66B21D] mt-1 shrink-0">
                                    <Phone className="size-5" />
                                </div>
                                <p className="text-slate-600 text-sm font-bold">
                                    +62 812-5653-4837
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="text-[#66B21D] mt-1 shrink-0">
                                    <Mail className="size-5" />
                                </div>
                                <p className="text-slate-600 text-sm font-bold truncate">
                                    ac.tiam2610@gmail.com
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-400 text-xs font-bold tracking-widest">
                        © {new Date().getFullYear()} AC Tiam. Seluruh Hak Cipta Dilindungi.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="#" className="text-slate-400 text-xs font-bold hover:text-[#66B21D] transition-colors tracking-widest">Syarat & Ketentuan</Link>
                        <Link href="#" className="text-slate-500 text-xs font-bold hover:text-[#66B21D] transition-colors tracking-widest">Kebijakan Privasi</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
