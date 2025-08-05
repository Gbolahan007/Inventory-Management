export default function HeaderInventory({ name }: { name: string }) {
  return (
    <div
      className="header-inventory"
      style={{
        backgroundColor: "hsl(var(--card))",
        color: "hsl(var(--foreground))",

        padding: "16px",
        borderRadius: "8px",
      }}
    >
      <h1>{name}</h1>
    </div>
  );
}
