export interface IReleaseBase {
  name: string;
  error: string | void;     // only set when invalid
}

export interface IInvalidRelease extends IReleaseBase {
  error: string;
}

export interface IRelease extends IReleaseBase {
  name: string;
  displayName: string;
  fileName: string;
  commit: string | void,
  publishedDate: Date;
  version: string;
  channel: string | void;
  size: Number;
  tag: string;
  location: string;
  repository: string; // url
  error: void;
  signature?: string // url
  metadata?: string // url
}

export interface IMetadata {
  name: string,
  icon: string; // url | relative path  
  md5?: string
  sha1?: string
  sha256?: string
  sha512?: string
  /*
  checksums: {
    md5?: string
    sha1?: string
    sha256?: string
    sha512?: string
  },
  signature: string,
  dependencies: string,
  permissions: string
  */
}

export interface IReleaseExtended extends IRelease {
  icon: string; // url | relative path
  checksums: {
    md5?: string
    sha1?: string
    sha256?: string
    sha512?: string
  },
  signature?: string
}

interface Publisher {
  publisherId: string, //uuid
  publisherName: string,
  displayName: string,
  flags: string
}

interface VersionInfo {}

interface PackageStatistics {
  install: Number;
  ratingCount: Number;
  avgRating: Number;
}

export interface IAppPackage extends IReleaseBase{
  packageId: string,
  packageName: string;
  flags: string;
  releaseDate: Date;
  lastUpdated: Date;
  publishedDate: Date;
  shortDescription: string;
  logo: string; //url
  publishers: Array<Publisher>
  statistics: PackageStatistics;
  versions: Array<VersionInfo>;
  readme: string; //url
  changelog: string; //url
  license: string; //url
}

