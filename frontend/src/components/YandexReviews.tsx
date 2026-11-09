import { ArrowRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import { yandexOrgUrl } from "../siteInfo"

import reviewsPhoto from "../assets/reviews-photo.jpg"

interface Review {
  id: number
  author: string
  status: string
  date: string
  rating: number
  text: string
}

const realReviews: Review[] = [
  {
    id: 1,
    author: "Евгения",
    status: "Знаток города 4 уровня",
    date: "21 мая",
    rating: 5,
    text: "Спонтанно решили зайти, потому что не любители баров, но поверили в кухню. И не разочаровались, более того, бар тоже на высоте, как и атмосфера. В будний день вечером очень уютно, спокойно, музыка хорошая, ненавязчивая. Персонал вежливый и приветливый. Пришли чтобы попробовать тар тар, понравился очень. Так же открыли для себя бургеры - много и вкусно, лучше, чем во многих бургерных. Вафли кстати, тоже кайфовые. Пиво тоже хорошее, брали кран, настойки приятные. Очень советую, отличное место",
  },
  {
    id: 2,
    author: "Tanya",
    status: "Дегустатор 3 уровня",
    date: "18 мая",
    rating: 5,
    text: "Невероятно атмосферное место, были очень рады что получилось забронировать столик буквально день в день. Вкусная кухня и хороший ценник, спасибо большое за качественное обслуживание. Приятный вечер в компании друзей скрасила чудесная программа, музыка и весёлый, совершенно ненавязчивый ведущий. Хочется возвращаться сюда снова и рекомендовать знакомым и друзьям",
  },
  {
    id: 3,
    author: "Виктория К.",
    status: "Знаток города 3 уровня",
    date: "27 июня",
    rating: 5,
    text: "Посетили бар и остались очень довольны! Атмосфера уютная, музыка приятная, а коктейли — вкусные и хорошо приготовленные. Отдельное спасибо официантке Валерии: вежливая, внимательная и быстро помогла с выбором. Всё обслуживание прошло на высшем уровне, без лишней суеты. Обязательно вернёмся снова! ❤️",
  }
]

export function YandexReviews() {
  return (
    <section className="relative py-16 px-6 overflow-hidden border-t border-gold/10">
      
      <div className="absolute inset-0 z-0">
        <img 
          src={reviewsPhoto} 
          alt="Атмосфера паба Einstein" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-display mb-3 text-gold drop-shadow-md">ОТЗЫВЫ ГОСТЕЙ</h2>
            <p className="text-offwhite drop-shadow-sm">Что говорят о нас на Яндекс.Картах.</p>
          </div>
          <a 
            href={yandexOrgUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gold flex items-center gap-2 hover:gap-4 transition-all uppercase text-sm font-bold drop-shadow-md"
          >
            Все отзывы <ArrowRight size={16} />
          </a>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {realReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-forest-dark/90 backdrop-blur-md border border-gold/30 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-gold/60 hover:shadow-[0_12px_40px_-8px_rgba(97,24,32,0.8)]"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-display font-bold text-base border border-gold/30 shrink-0">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-offwhite font-bold text-sm">{review.author}</h4>
                    <p className="text-offwhite-dim text-[10px] leading-tight mt-0.5">{review.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star 
                        key={starIndex} 
                        size={12} 
                        className={starIndex < review.rating ? "fill-gold text-gold" : "text-gray-600"} 
                      />
                    ))}
                  </div>
                  <span className="text-offwhite-dim text-[11px]">{review.date}</span>
                </div>

                <p className="text-offwhite-dim text-xs leading-relaxed mb-2">
                  {review.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <a
            href={yandexOrgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-forest-dark/80 border border-gold text-gold font-bold uppercase text-xs rounded-sm hover:bg-gold/20 transition-colors backdrop-blur-sm"
          >
            Оставить отзыв на Яндекс.Картах
          </a>
        </motion.div>

      </div>
    </section>
  )
}