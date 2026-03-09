'use client'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

interface LinkItem {
    title: string;
    href: string;
    icon?: React.ReactNode;
}

const links: { group: string; items: LinkItem[] }[] = [
    {
        group: 'Contact',
        items: [
            {
                title: 'ac.tiam2610@gmail.com',
                href: 'mailto:ac.tiam2610@gmail.com',
                icon: <Mail className="size-4 shrink-0" />,
            },
            {
                title: '+62 812-5653-4837',
                href: 'tel:+6281256534837',
                icon: <Phone className="size-4 shrink-0" />,
            },
            {
                title: 'LTC GLODOK, Lt. UG Blok B11 No.6 Jl.Hayam Wuruk No.127, Jakarta Barat',
                href: '#',
                icon: <MapPin className="size-4 shrink-0" />,
            },
        ],
    },
    {
        group: 'Product',
        items: [
            {
                title: 'Pricing',
                href: '/pricing',
            },
            {
                title: 'Contact Page',
                href: '/cust/contactus',
            },
        ],
    },
]

export default function FooterSection() {
    return (
        <footer className="border-t bg-white pt-20 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="block size-fit">
                            <Logo />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:col-span-3">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="space-y-4 text-sm">
                                <span className="block text-lg font-semibold">{link.group}</span>
                                <div className="space-y-3">
                                    {link.items.map((item, index) => (
                                        <div key={index}>
                                            {item.icon ? (
                                                <div className="flex items-start gap-3 text-muted-foreground">
                                                    <span className="mt-0.5">{item.icon}</span>
                                                    <span>{item.title}</span>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-primary block duration-150">
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12 border-t py-6">
                    <span className="text-muted-foreground block text-center text-sm">© {new Date().getFullYear()} Tiamac. All rights reserved</span>
                </div>
            </div>
        </footer>
    )
}
