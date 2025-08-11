import React, { useEffect, useState, useRef, UIEvent } from "react";
import { dashboardAPI } from "@/services/api";

// Define the type for a news item
interface NewsItem {
  title: string;
  description: string;
  date?: string;
}

const PAGE_SIZE = 6;

const NewsBox = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Initial load
    setNews([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
  }, []);

  useEffect(() => {
    if (!hasMore && page !== 1) return;
    
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await dashboardAPI.getNews(page, PAGE_SIZE);
        setNews((prev) => [...prev, ...(data.news || [])]);
        setTotal(data.total || 0);
        setHasMore((page * PAGE_SIZE) < (data.total || 0));
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch news");
        setLoading(false);
      }
    };

    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleScroll = (e: UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && hasMore && !loading) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg h-[500px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Latest News</h3>
      {error && <div className="text-danger">Error: {error}</div>}
      <ul
        className="space-y-4 flex-grow overflow-y-auto pr-2"
        style={{ minHeight: 0 }}
        onScroll={handleScroll}
        ref={listRef}
      >
        {news.map((item, idx) => (
          <li key={idx}>
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
            {item.date && <div className="text-xs text-muted-foreground mt-1">{item.date}</div>}
          </li>
        ))}
        {loading && <li>Loading...</li>}
        {!loading && news.length === 0 && <li>No news available.</li>}
      </ul>
    </div>
  );
};

export default NewsBox; 