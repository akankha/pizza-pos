import { APP_VERSION, COPYRIGHT, DEVELOPER } from "../../../shared/version";

export default function VersionInfo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`text-center text-sm text-gray-500 dark:text-slate-400 ${className}`}
    >
      <p className="font-semibold">{APP_VERSION}</p>
      <p className="text-xs mt-1">
        Developed by{" "}
        <a
          href={DEVELOPER.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline"
        >
          {DEVELOPER.name}
        </a>
      </p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
        {COPYRIGHT}
      </p>
    </div>
  );
}
