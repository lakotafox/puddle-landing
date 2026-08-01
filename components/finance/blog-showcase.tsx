"use client";

import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

const ease = [0.16, 1, 0.3, 1] as const;

type Article = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  href: string;
};

const articles: Article[] = [
  {
    title: "The Future of Open Banking: What It Means for Your Money",
    excerpt:
      "Open banking is reshaping how we interact with financial services. Learn how APIs are creating new opportunities for better money management.",
    category: "Industry Trends",
    date: "Jan 8, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    href: "#",
  },
  {
    title: "5 Smart Strategies to Build Your Emergency Fund in 2026",
    excerpt:
      "Financial security starts with preparation. Discover practical tips to grow your emergency savings without sacrificing your lifestyle.",
    category: "Personal Finance",
    date: "Jan 5, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    href: "#",
  },
  {
    title: "Understanding Real-Time Payments: Speed Meets Security",
    excerpt:
      "Instant payments are becoming the norm. Here's how modern infrastructure ensures your money moves fast without compromising safety.",
    category: "Technology",
    date: "Jan 2, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
    href: "#",
  },
];

function ArticleCard({ article, index }: { article: Article; index: number }): ReactNode {
  return (
    <motion.a
      href={article.href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease }}
      className="group block"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-md bg-muted mb-4">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-500 group-hover:scale-105 grayscale group-hover:filter-none"
        />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-medium text-accent">{article.category}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{article.date}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{article.readTime}</span>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
        {article.title}
      </h3>
      {/* <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {article.excerpt}
      </p> */}
    </motion.a>
  );
}

export function BlogShowcase(): ReactNode {
  return (
    <section className="relative w-full bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-serif leading-tight text-foreground">
              Latest from our blog
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Insights, guides, and news to help you make smarter financial decisions.
            </p>
          </motion.div>
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors shrink-0"
          >
            View all articles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <ArticleCard key={article.title} article={article} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
