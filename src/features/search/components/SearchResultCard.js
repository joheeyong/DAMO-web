import './SearchResultCard.css';

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || '';
}

function BlogCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card">
      <h3 className="card-title">{stripHtml(item.title)}</h3>
      <p className="card-desc">{stripHtml(item.description)}</p>
      <div className="card-meta">
        <span>{item.bloggername}</span>
        <span>{item.postdate}</span>
      </div>
    </a>
  );
}

function NewsCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card">
      <h3 className="card-title">{stripHtml(item.title)}</h3>
      <p className="card-desc">{stripHtml(item.description)}</p>
      <div className="card-meta">
        <span>{item.originallink ? '원문' : ''}</span>
        <span>{item.pubDate?.substring(0, 16)}</span>
      </div>
    </a>
  );
}

function CafeCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card">
      <h3 className="card-title">{stripHtml(item.title)}</h3>
      <p className="card-desc">{stripHtml(item.description)}</p>
      <div className="card-meta">
        <span>{item.cafename}</span>
      </div>
    </a>
  );
}

function ShopCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card shop-card">
      {item.image && <img src={item.image} alt="" className="card-image" />}
      <div className="card-body">
        <h3 className="card-title">{stripHtml(item.title)}</h3>
        <p className="card-price">{Number(item.lprice).toLocaleString()}원</p>
        <div className="card-meta">
          <span>{item.mallName}</span>
          <span>{item.category1}</span>
        </div>
      </div>
    </a>
  );
}

function ImageCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card image-card">
      <img src={item.thumbnail} alt="" className="card-thumbnail" />
      <p className="card-title small">{stripHtml(item.title)}</p>
    </a>
  );
}

function KinCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card">
      <h3 className="card-title">{stripHtml(item.title)}</h3>
      <p className="card-desc">{stripHtml(item.description)}</p>
    </a>
  );
}

function BookCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card shop-card">
      {item.image && <img src={item.image} alt="" className="card-image book-image" />}
      <div className="card-body">
        <h3 className="card-title">{stripHtml(item.title)}</h3>
        <p className="card-desc">{item.author} | {item.publisher}</p>
        <p className="card-price">{Number(item.discount || 0).toLocaleString()}원</p>
      </div>
    </a>
  );
}

function WebCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="result-card">
      <h3 className="card-title">{stripHtml(item.title)}</h3>
      <p className="card-desc">{stripHtml(item.description)}</p>
    </a>
  );
}

const CARD_MAP = {
  blog: BlogCard,
  news: NewsCard,
  cafe: CafeCard,
  shop: ShopCard,
  image: ImageCard,
  kin: KinCard,
  book: BookCard,
  webkr: WebCard,
};

export default function SearchResultCard({ category, item }) {
  const Card = CARD_MAP[category] || WebCard;
  return <Card item={item} />;
}
