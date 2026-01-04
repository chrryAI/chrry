import { StylesConfig } from "react-select"

export const selectStyles: StylesConfig = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--background)",
    border: (() => {
      if (state.isFocused) return "1px solid var(--link-color)"

      return "1px solid var(--shade-2)"
    })(),
    color: "var(--accent-0)",
    borderRadius: "var(--radius)",
    width: "fit-content",
    cursor: "text",
    minWidth: "200px",
    transition: "var(--border-transition)",
  }),
  option: (base, state) => ({
    ...base,
    color: (() => {
      if (state.isFocused || state.isSelected) return "white"

      return "var(--foreground)"
    })(),
    backgroundColor: (() => {
      if (state.isFocused) return "var(--link-color)"

      return state.isSelected ? "var(--accent-5)" : "var(--background)"
    })(),
    //   padding: ".5rem 3rem .5rem .5rem",
    borderRadius: "7px",
    cursor: "pointer",
    margin: "10px 0",
    "&:active": {
      backgroundColor: "var(--accent-5)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--background)",
    border: "1px solid var(--shade-2)",
    borderRadius: "var(--radius)",
    padding: "7.5px 5px",
    // minWidth: "500px",
    top: "35px",
    maxWidth: "100%",
    boxShadow: "var(--shadow)",
  }),
  menuList: (base) => ({
    ...base,
    padding: "0",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground)",
  }),
}
