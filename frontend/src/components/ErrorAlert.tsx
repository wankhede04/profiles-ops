interface Props {
  message: string;
}

export default function ErrorAlert({ message }: Props) {
  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
      <strong className="font-semibold">Error: </strong>
      {message}
    </div>
  );
}
