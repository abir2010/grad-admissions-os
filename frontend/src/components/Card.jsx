function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      {title ? <h2 className="mb-4 text-lg font-semibold text-slate-950">{title}</h2> : null}
      {children}
    </section>
  );
}

export default Card;
