import { useEffect, useState, type FormEvent } from "react";
import { Plus, X, AlertCircle, LoaderCircle } from "lucide-react";

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

function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} сом`;
}

export default function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadAds = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = (await response.json()) as AdsResponse;
      setAds(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить объявления.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAds();
  }, []);

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const numericPrice = Number(price.replace(",", "."));

    if (!cleanTitle || !cleanDescription) {
      setSubmitError("Заполните заголовок и описание.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setSubmitError("Введите корректную цену.");
      return;
    }

    const formData = new FormData();
    formData.append("title", cleanTitle);
    formData.append("description", cleanDescription);
    formData.append("price", String(numericPrice));
    if (image) {
      formData.append("image", image);
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Ошибка сервера: ${response.status}`);
      }

      const newAd = (await response.json()) as Ad;
      setAds((current) => [newAd, ...current]);
      setTitle("");
      setDescription("");
      setPrice("");
      setImage(null);
      setSubmitError("");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить объявление.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <h1 className="page-title">Доска объявлений</h1>

      <div className="panel">
        <button type="button" className="top-button">
          <Plus size={18} />
          Подать объявление
        </button>

        <form className="simple-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Заголовок</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: Ноутбук ASUS"
            />
          </label>

          <label className="field-group">
            <span>Описание</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Подробное описание товара..."
            />
          </label>

          <label className="field-group">
            <span>Цена (сом)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label className="field-group">
            <span>Изображение</span>
            <div className="file-row">
              <label className="file-pick">
                <span>Выберите файл</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                />
              </label>
              <span className="file-name">{image ? image.name : "Файл не выбран"}</span>
            </div>

            {imagePreview && (
              <div className="preview-block">
                <img src={imagePreview} alt="Предпросмотр" />
                <button type="button" className="remove-image" onClick={() => setImage(null)}>
                  <X size={14} />
                  Удалить
                </button>
              </div>
            )}
          </label>

          {submitError && (
            <div className="error-box">
              <AlertCircle size={18} />
              {submitError}
            </div>
          )}

          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle size={18} className="spin" />
                Отправляем…
              </>
            ) : (
              <>
                <Plus size={18} />
                Опубликовать
              </>
            )}
          </button>
        </form>
      </div>

      <div className="list-block">
        <div className="list-header">
          <h2>Объявления</h2>
          <button type="button" className="refresh-btn" onClick={() => void loadAds()}>
            Обновить
          </button>
        </div>

        {loading ? (
          <div className="state-box">Загрузка…</div>
        ) : loadError ? (
          <div className="state-box error">{loadError}</div>
        ) : ads.length === 0 ? (
          <div className="state-box">Пока объявлений нет.</div>
        ) : (
          <div className="ads-list">
            {ads.map((ad) => {
              const src = imageSrc(ad.image_url);
              return (
                <article key={ad.id} className="ad-card">
                  <div className="ad-image-wrap">
                    {src ? (
                      <img src={src} alt={ad.title} />
                    ) : (
                      <div className="ad-image-placeholder">Нет фото</div>
                    )}
                  </div>
                  <div className="ad-info">
                    <div className="ad-price">{formatPrice(ad.price)}</div>
                    <h3>{ad.title}</h3>
                    <p>{ad.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
