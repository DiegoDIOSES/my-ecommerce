export type MockProduct = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image: string;
  tag?: "Más vendido" | "Oferta";
};

export const mockProducts: MockProduct[] = [
  {
    id: "p1",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "tote",
    image:
      "https://images.unsplash.com/photo-1618354691321-9d73d9c14a46?auto=format&fit=crop&w=1200&q=80",
    tag: "Más vendido",
  },
  {
    id: "p2",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "tote",
    image:
      "https://images.unsplash.com/photo-1615485737651-1bb4edb5e5f5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "tote",
    image:
      "https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=1200&q=80",
    tag: "Más vendido",
  },
  {
    id: "p4",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "mini",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    tag: "Oferta",
  },
  {
    id: "p5",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "wallet",
    image:
      "https://images.unsplash.com/photo-1524594227084-6b1f2100d69c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p6",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "tote",
    image:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p7",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "mini",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p8",
    name: "Soy un producto",
    price: 15.0,
    categoryId: "wallet",
    image:
      "https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=1200&q=80",
  },
];