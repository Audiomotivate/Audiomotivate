import Header from "../components/header";

export default function CartPage() {
  return (
    <>
      <Header showMobileFixedSearch={false} />
      <div className="min-h-screen bg-gray-50 py-12 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Mi Carrito</h1>
          <p className="text-center text-gray-600">Tu carrito está vacío</p>
        </div>
      </div>
    </>
  );
}