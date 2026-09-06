/** Hidden field bots fill in. Named innocuously; must stay empty. */
export const HONEYPOT_FIELD = "_hp";

type HoneypotProps = {
  /** Register the input with react-hook-form: `<Honeypot {...register("_hp")} />`. */
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  ref?: React.Ref<HTMLInputElement>;
};

export function Honeypot({ name = HONEYPOT_FIELD, ...rest }: HoneypotProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[9999px] h-px w-px overflow-hidden"
    >
      <label htmlFor={name}>Leave this field empty</label>
      <input
        id={name}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...rest}
      />
    </div>
  );
}
