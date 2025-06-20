export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-3 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <div className="border-t border-gray-700 pt-3 pb-2">
            <div className="text-gray-400 space-x-4 text-sm">
              <a href="/terminos" className="hover:text-white">Términos de Servicio</a>
              <span>•</span>
              <a href="/privacidad" className="hover:text-white">Política de Privacidad</a>
            </div>
          </div>
          <div className="border-t border-gray-800 text-center text-gray-400 pt-2">
            <p className="text-sm">© 2025 Audio Motívate. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}