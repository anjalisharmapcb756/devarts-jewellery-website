import { useParams } from "react-router-dom";
import Products from "./Products";
export default function CollectionDetail() { const { slug } = useParams(); return <Products collectionSlug={slug} />; }
