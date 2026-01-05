import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const features = [
    { title: "Nhanh", desc: "Vite + React khởi động và reload rất nhanh." },
    { title: "Tiện lợi", desc: "Tailwind giúp viết UI nhanh với utility classes." },
    { title: "Nhẹ", desc: "Cấu trúc tối giản, dễ mở rộng." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800">
      <header className="bg-white/60 backdrop-blur sticky top-0 z-10 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">MyApp</h1>
          <nav className="space-x-4 text-sm">
            <a className="text-slate-600 hover:text-slate-900" href="#features">Tính năng</a>
            <a className="text-slate-600 hover:text-slate-900" href="#demo">Thử</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-extrabold mb-4">Khởi tạo nhanh với Vite + React + Tailwind</h2>
            <p className="text-slate-600 mb-6">
              Đây là trang demo để kiểm tra cấu hình. Bạn có thể chỉnh sửa <code>src/App.jsx</code> và thấy thay đổi ngay.
            </p>

            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 bg-slate-900 text-white rounded-md shadow hover:bg-slate-800"
                onClick={() => setCount((c) => c + 1)}
              >
                Tăng counter
              </button>
              <button
                className="px-4 py-2 bg-white border rounded-md hover:bg-slate-50"
                onClick={() => setCount(0)}
              >
                Reset
              </button>
              <div className="ml-4 text-sm text-slate-700">
                Counter: <span className="font-medium">{count}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-indigo-50 to-rose-50 rounded-xl p-6 shadow">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5a6b2f2b1f3a8e3f7d8e2c3f6d9e8b0a"
              alt="demo"
              className="w-full h-44 object-cover rounded-md mb-4"
            />
            <p className="text-sm text-slate-700">
              Mẫu giao diện: hero + nút tương tác + ảnh minh họa. Thay ảnh hoặc lớp Tailwind tùy ý.
            </p>
          </div>
        </section>

        <section id="features" className="mt-12">
          <h3 className="text-2xl font-semibold mb-4">Tính năng nổi bật</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="p-4 bg-white rounded-lg shadow-sm border">
                <h4 className="font-semibold mb-2">{f.title}</h4>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="mt-12">
          <h3 className="text-xl font-medium mb-3">Ví dụ component</h3>
          <div className="flex gap-4 flex-wrap">
            <Badge text="Beta" color="bg-rose-100 text-rose-700" />
            <Badge text="Vite" color="bg-indigo-100 text-indigo-700" />
            <Badge text="Tailwind" color="bg-sky-100 text-sky-700" />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} MyApp — Demo cấu hình Vite + React + Tailwind
        </div>
      </footer>
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <span className={`px-3 py-1 text-sm rounded-full font-medium ${color} border`}>{text}</span>
  );
}