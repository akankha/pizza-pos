import { APP_VERSION, COPYRIGHT, DEVELOPER } from "../../../shared/version";

export default function VersionInfo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`text-center text-sm text-gray-500 ${className}`}>
      <p className="font-semibold">{APP_VERSION}</p>
      <p className="text-xs mt-1">
        Developed by{" "}
        <a
          href={DEVELOPER.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 hover:text-orange-700 hover:underline"
        >
          {DEVELOPER.name}
        </a>
      </p>
      <p className="text-xs text-gray-400 mt-1">{COPYRIGHT}</p>
    </div>
  );
}
