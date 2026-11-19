import { motion } from "framer-motion"
import { MapPin, Phone, Clock } from "lucide-react"
import {
  address,
  mapEmbedUrl,
  mapLink,
  openingHours,
  phone,
  socialLinks,
} from "../siteInfo"
import { OpenStatus } from "../components/OpenStatus"
import { FormulaBackdrop } from "../components/FormulaBackdrop"

// Равномерная смесь узоров афиши и галереи: по шесть формул каждого типа.
const contactsPattern = {
  image: `url("data:image/svg+xml,${encodeURIComponent(`<svg width='400' height='350' xmlns='http://www.w3.org/2000/svg' font-family='serif' fill='#fabc55'>
    <text x='20' y='52' font-size='38' transform='rotate(-15 20 52)'>E=mc²</text>
    <text x='220' y='36' font-size='28' transform='rotate(12 220 36)'>c = λν</text>
    <text x='170' y='112' font-size='54' transform='rotate(10 170 112)'>∑</text>
    <text x='18' y='154' font-size='36' transform='rotate(-8 18 154)'>E = hν</text>
    <text x='245' y='175' font-size='48' transform='rotate(-18 245 175)'>πr²</text>
    <text x='105' y='218' font-size='21' transform='rotate(-4 105 218)'>1/F = 1/d + 1/f</text>
    <text x='20' y='292' font-size='48' transform='rotate(-5 20 292)'>∫</text>
    <text x='182' y='270' font-size='20' transform='rotate(6 182 270)'>n₁ sin α = n₂ sin β</text>
    <text x='320' y='90' font-size='34' transform='rotate(25 320 90)'>√−1</text>
    <text x='315' y='328' font-size='26' transform='rotate(14 315 328)'>f/1.8</text>
    <text x='95' y='330' font-size='30' transform='rotate(15 95 330)'>∮</text>
    <text x='330' y='235' font-size='42' transform='rotate(-10 330 235)'>λ</text>
  </svg>`)}")`,
  size: "400px 350px",
}

export function Contacts() {
  return (
    <FormulaBackdrop pattern={contactsPattern}>
    <div className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-display text-gold mb-4">
          КОНТАКТЫ
        </h1>
        <p className="text-offwhite-dim">
          Приходите в гости или напишите нам — мы всегда рады хорошей беседе.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8 bg-forest-light/10 border border-gold/10 rounded-2xl overflow-hidden p-2">
        {/* Map Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 relative h-[400px] lg:h-auto rounded-xl overflow-hidden"
        >
          <iframe
            src={mapEmbedUrl}
            title={`Карта: ${address.street}, ${address.city}`}
            width="100%"
            height="100%"
            style={{
              border: 0,
              filter: "brightness(0.9) contrast(1.05) saturate(0.7)",
            }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </motion.div>

        {/* Contact Info Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-8 md:p-12 glassmorphism rounded-xl flex flex-col justify-center"
        >
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase text-offwhite-dim mb-3">
                Адрес
              </h3>
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <MapPin className="text-gold mt-1 shrink-0" size={20} />
                <span className="text-offwhite group-hover:text-gold transition-colors text-lg">
                  {address.street}
                  <br />
                  <span className="whitespace-nowrap">{address.city}</span>
                </span>
              </a>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase text-offwhite-dim mb-3">
                Бронирование и справки
              </h3>
              <a
                href={phone.href}
                className="flex items-center gap-3 group hover:bg-gold/10 p-2 -ml-2 rounded-lg transition-colors w-max"
              >
                <Phone className="text-gold shrink-0" size={20} />
                <span className="text-offwhite group-hover:text-gold transition-colors text-lg">
                  {phone.label}
                </span>
              </a>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase text-offwhite-dim mb-3">
                Часы работы
              </h3>
              <div className="flex items-start gap-3">
                <Clock className="text-gold mt-1 shrink-0" size={20} />
                <div className="text-offwhite space-y-1">
                  {openingHours.map(({ days, time }) => (
                    <p key={days}>
                      {days}: <span className="text-gold">{time}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-3 ml-8">
                <OpenStatus />
              </div>
            </div>

            <div className="pt-4 border-t border-gold/10 flex gap-4">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-forest-dark transition-all duration-300"
                >
                  <Icon size={22} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </FormulaBackdrop>
  )
}