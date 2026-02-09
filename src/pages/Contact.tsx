import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Instagram, Facebook, Twitter, Linkedin, Send, MapPin, Phone, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Petición",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simular envío
        setTimeout(() => {
            const mailtoUrl = `mailto:radarnutresa@gmail.com?subject=${formData.subject} - ${formData.name}&body=${formData.message} (De: ${formData.email})`;
            window.location.href = mailtoUrl;

            toast.success("¡Solicitud generada!", {
                description: "Se ha abierto tu cliente de correo para enviar el PQR."
            });
            setIsSubmitting(false);
            setFormData({ name: "", email: "", subject: "Petición", message: "" });
        }, 1000);
    };

    const socialLinks = [
        { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/gruponutresa/", color: "hover:text-pink-500" },
        { name: "Facebook", icon: Facebook, url: "https://www.facebook.com/GrupoNutresa/", color: "hover:text-blue-600" },
        { name: "Twitter", icon: Twitter, url: "https://twitter.com/GrupoNutresa", color: "hover:text-sky-400" },
        { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/company/grupo-nutresa/", color: "hover:text-blue-700" }
    ];

    return (
        <div className="min-h-screen bg-stone-50">
            <Header />

            <main className="max-w-[1440px] mx-auto px-6 xl:px-12 py-20">
                <div className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Canal de Comunicación</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-stone-900 uppercase tracking-tighter leading-[0.9] mb-6">
                            Contacto & <span className="text-emerald-600 italic">Soporte</span>
                        </h1>
                        <p className="text-stone-500 max-w-2xl mx-auto font-medium text-lg">
                            ¿Tienes dudas, sugerencias o necesitas reportar un problema? Nuestro equipo de Inteligencia Comercial está listo para ayudarte.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Information Column */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-12 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/50"
                            >
                                <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight mb-10">Canales Oficiales</h3>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                                            <Mail className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Email de Soporte</p>
                                            <p className="text-stone-900 font-bold text-lg select-all">radarnutresa@gmail.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 shadow-sm">
                                            <MapPin className="w-6 h-6 text-stone-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Ubicación</p>
                                            <p className="text-stone-900 font-bold text-lg leading-tight">Medellín, Colombia</p>
                                            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Sede Administrativa</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 shadow-sm">
                                            <Globe className="w-6 h-6 text-stone-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Web Corporativa</p>
                                            <a href="https://gruponutresa.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold text-lg hover:underline transition-all">gruponutresa.com</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-14 pt-12 border-t border-stone-100">
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">Síguenos en Redes</p>
                                    <div className="flex gap-4">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={social.name}
                                                className={`w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center transition-all ${social.color} hover:bg-white hover:shadow-xl hover:-translate-y-1 border border-stone-100`}
                                            >
                                                <social.icon className="w-6 h-6" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* PQR Form Column */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white p-12 md:p-16 rounded-[3rem] border border-stone-100 shadow-2xl shadow-stone-200/40 relative overflow-hidden group"
                            >
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-emerald-500/10 duration-1000"></div>

                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-4 leading-none">Generar PQR</h3>
                                    <p className="text-stone-400 font-medium text-lg mb-12 max-w-xl">Completa el formulario para enviarnos una petición, queja o recurso formal de manera inmediata.</p>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label htmlFor="name-input" className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1">Nombre Completo</label>
                                                <Input
                                                    id="name-input"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Ej: Juan Pérez"
                                                    className="rounded-2xl border-stone-100 bg-stone-50/50 focus:bg-white h-16 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/5 text-lg font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label htmlFor="email-input" className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1">Correo Corporativo</label>
                                                <Input
                                                    id="email-input"
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="juan@serviciosnutresa.com"
                                                    className="rounded-2xl border-stone-100 bg-stone-50/50 focus:bg-white h-16 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/5 text-lg font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <label htmlFor="subject-select" className="text-[11px] font-black text-stone-700 uppercase tracking-widest">Tipo de Solicitud</label>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-80">Categorización Obligatoria</span>
                                            </div>
                                            <div className="relative group/select">
                                                <select
                                                    id="subject-select"
                                                    aria-label="Seleccione el tipo de solicitud"
                                                    className="w-full appearance-none rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white h-16 px-6 text-lg font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all duration-300 pr-14 text-stone-800 cursor-pointer"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                >
                                                    <option>Petición</option>
                                                    <option>Queja</option>
                                                    <option>Recurso / Sugerencia</option>
                                                    <option>Fallo Técnico</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 group-hover/select:text-emerald-500 transition-colors">
                                                    <ChevronRight className="w-5 h-5 rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-stone-700 uppercase tracking-widest ml-1">Mensaje / Descripción</label>
                                            <Textarea
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Describe detalladamente tu requerimiento (incluye EAN o Tienda si es un fallo)..."
                                                className="rounded-[2.5rem] border-stone-100 bg-stone-50/50 focus:bg-white min-h-[220px] p-8 transition-all duration-300 focus:ring-4 focus:ring-emerald-500/5 text-lg font-medium leading-relaxed"
                                            />
                                        </div>

                                        <Button
                                            disabled={isSubmitting}
                                            className={`w-full h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 group/btn ${isSubmitting ? 'bg-stone-100 text-stone-400' : 'bg-stone-900 hover:bg-emerald-600 text-white'
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                                                    Sincronizando...
                                                </>
                                            ) : (
                                                <>
                                                    Enviar Solicitud Oficial
                                                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
