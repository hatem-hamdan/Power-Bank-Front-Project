import { COLOR_SWATCH } from "../../data/catalog";

export function OptionGroup({ label, value, options, onChange }) {
  return (
    <div>
      <div className="field-label">
        {label}: <span style={{ fontWeight: 500 }}>{value}</span>
      </div>
      <div className="choices">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={option === value ? "choice on" : "choice"}
            onClick={() => onChange(option)}
          >
            {label === "Color" ? (
              <span className="swatch" style={{ background: COLOR_SWATCH[option] || "#999" }} />
            ) : null}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
