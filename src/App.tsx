import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Search, Plus, ImagePlus, X, RefreshCw, PackageOpen, ArrowUpRight,
  ShoppingBag, CheckCircle2, AlertCircle, LoaderCircle
} from "lucide-react";

const API_URL = "https://inai-col1.fishrungames.com/ads";
const API_ORIGIN = new URL(API_URL).origin;

type Ad = {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
};

type AdsResponse = {
  items: Ad[];
  total: number;
  page: number;
  limit: number;
};

function imageSrc(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KGS",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadAds = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Сервер ответил с кодом ${response.status}`);
      const data = (await response.json()) as AdsResponse;
      setAds(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : (data.items?.length ?? 0));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? `${error.message}. Проверьте соединение с сервером и доступность API.`
          : "Не удалось загрузить объявления.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAds();
  }, [loadAds]);

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const filteredAds = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru");
    if (!query) return ads;
    return ads.filter((ad) =>
      `${ad.title} ${ad.description}`.toLocaleLowerCase("ru").includes(query),
    );
  }, [ads, search]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setImage(null);
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");

    const numericPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setSubmitError("Введите корректную цену, не меньше нуля.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("price", String(numericPrice));
    if (image) formData.append("image", image);

    setSubmitting(true);
    try {
      const response = await fetch(API_URL, { method: "POST", body: formData });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(body || `Сервер ответил с кодом ${response.status}`);
      }
      const created = (await response.json()) as Ad;
      setAds((current) => [created, ...current.filter((ad) => ad.id !== created.id)]);
      setTotal((current) => current + 1);
      setSuccessMessage("Объявление успешно опубликовано!");
      resetForm();
      setIsFormOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? `${error.message}. Если ошибка связана с CORS, сервер должен разрешить запросы с домена GitHub Pages.`
          : "Не удалось отправить объявление.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Маркет — главная">
          <span className="brand-mark"><ShoppingBag size={22} strokeWidth={2.4} /></span>
          <span>маркет<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="desktop-note">Покупай. Продавай. Находи своё.</span>
          <button className="primary-button header-button" onClick={() => { setIsFormOpen(true); setSubmitError(""); }}>
            <Plus size={18} /> <span>Разместить объявление</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> ПРОСТОЙ СПОСОБ НАЙТИ СВОЁ</div>
            <h1>Хорошие вещи<br />ищут <span>новых хозяев.</span></h1>
            <p>Покупайте то, что нужно. Продавайте то, чем больше не пользуетесь.</p>
            <button className="hero-button" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>
              Смотреть объявления <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-card art-card-back"><div className="art-line" /><div className="art-line short" /></div>
            <div className="art-card art-card-front">
              <div className="art-bag"><ShoppingBag size={76} strokeWidth={1.25} /></div>
              <div className="art-label">Новая история<br /><b>начинается здесь</b></div>
            </div>
            <span className="spark spark-one">✳</span><span className="spark spark-two">✦</span>
            <span className="art-pill">♻ Вещи обретают вторую жизнь</span>
          </div>
        </section>

        <section className="listing-section" id="listings">
          <div className="section-heading">
            <div>
              <div className="section-kicker">ВЫБИРАЙТЕ СВОЁ</div>
              <h2>Свежие объявления <span className="count-badge">{total}</span></h2>
              <p className="section-subtitle">Возможно, здесь уже есть то, что вы ищете.</p>
            </div>
            <button className="refresh-button" onClick={() => void loadAds()} disabled={loading} aria-label="Обновить список">
              <RefreshCw size={17} className={loading ? "spin" : ""} /> Обновить
            </button>
          </div>

          {successMessage && <div className="notice success-notice"><CheckCircle2 size={18} />{successMessage}<button onClick={() => setSuccessMessage("")} aria-label="Закрыть"><X size={16} /></button></div>}

          <label className="search-box">
            <Search size={20} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти объявление по названию или описанию..." />
            {search && <button onClick={() => setSearch("")} aria-label="Очистить поиск"><X size={17} /></button>}
          </label>

          {loading ? (
            <div className="state-panel"><LoaderCircle size={32} className="spin" /><h3>Загружаем объявления</h3><p>Уже обращаемся к серверу…</p></div>
          ) : loadError ? (
            <div className="state-panel error-panel"><AlertCircle size={34} /><h3>Не удалось загрузить список</h3><p>{loadError}</p><button className="primary-button" onClick={() => void loadAds()}><RefreshCw size={17} /> Попробовать снова</button></div>
          ) : filteredAds.length === 0 ? (
            <div className="state-panel"><PackageOpen size={38} /><h3>{search ? "Ничего не найдено" : "Пока нет объявлений"}</h3><p>{search ? "Попробуйте изменить поисковый запрос." : "Станьте первым — разместите своё объявление."}</p>{!search && <button className="primary-button" onClick={() => setIsFormOpen(true)}><Plus size={18} /> Разместить объявление</button>}</div>
          ) : (
            <div className="ads-grid">
              {filteredAds.map((ad) => {
                const src = imageSrc(ad.image_url);
                return (
                  <article className="ad-card" key={ad.id}>
                    <div className="ad-image-wrap">
                      {src ? <img src={src} alt={ad.title} className="ad-image" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.classList.add("image-missing"); }} /> : null}
                      <div className="image-placeholder"><ImagePlus size={31} /><span>Фото не добавлено</span></div>
                      <span className="ad-tag">Объявление</span>
                    </div>
                    <div className="ad-content">
                      <div className="ad-price">{formatPrice(ad.price)}</div>
                      <h3>{ad.title}</h3>
                      <p>{ad.description || "Продавец не добавил описание."}</p>
                      <div className="ad-footer"><span>ID объявления: {ad.id}</span><span className="ad-status"><span /> Активно</span></div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {!loading && !loadError && filteredAds.length > 0 && <div className="results-note">Показано объявлений: <b>{filteredAds.length}</b>{search ? " · Поиск по загруженному списку" : ""}</div>}
        </section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><ShoppingBag size={18} /></span><span>маркет<span className="brand-dot">.</span></span></a><span>Пусть хорошие вещи находят новых хозяев.</span><span>© 2026 Маркет</span></footer>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setIsFormOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading"><div><div className="section-kicker">ВАШЕ ОБЪЯВЛЕНИЕ</div><h2 id="modal-title">Что продаём?</h2><p>Заполните информацию — и можно публиковать.</p></div><button className="icon-button" onClick={() => setIsFormOpen(false)} disabled={submitting} aria-label="Закрыть"><X size={21} /></button></div>
            <form onSubmit={handleSubmit} className="ad-form">
              <label className="field-label">Название объявления <span>*</span><input required minLength={2} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, ноутбук в отличном состоянии" /></label>
              <label className="field-label">Описание <span>*</span><textarea required minLength={5} maxLength={2000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Расскажите о состоянии и особенностях вещи…" /></label>
              <label className="field-label">Цена (сом) <span>*</span><div className="price-input"><input required type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" /><span>сом</span></div></label>
              <label className="field-label">Фотография <span className="optional-label">необязательно</span>
                <div className={`upload-box ${imagePreview ? "has-preview" : ""}`}>
                  {imagePreview ? <><img src={imagePreview} alt="Предпросмотр изображения" /><div className="upload-info"><b>{image?.name}</b><span>{image ? `${(image.size / 1024 / 1024).toFixed(2)} МБ` : ""}</span><button type="button" className="remove-image" onClick={() => setImage(null)}><X size={15} /> Удалить</button></div></> : <><ImagePlus size={26} /><b>Добавьте фотографию</b><span>JPG, PNG, WEBP или BMP</span><input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} aria-label="Выбрать изображение" /></>}
                </div>
              </label>
              {submitError && <div className="notice error-notice"><AlertCircle size={18} />{submitError}</div>}
              <div className="form-actions"><button type="button" className="secondary-button" onClick={() => { setIsFormOpen(false); setSubmitError(""); }} disabled={submitting}>Отмена</button><button type="submit" className="primary-button submit-button" disabled={submitting}>{submitting ? <><LoaderCircle size={18} className="spin" /> Отправляем…</> : <><Plus size={18} /> Опубликовать</>}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
