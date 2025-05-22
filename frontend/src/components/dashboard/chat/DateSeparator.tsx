interface DateSeparatorProps {
  date: string;
}

const DateSeparator = ({ date }: DateSeparatorProps) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
      {date}
    </div>
  </div>
);

export default DateSeparator;
