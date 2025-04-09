export interface FileObject {
    relPath?: string;
    absoluteUrl?: string;
}

export type File = string | FileObject;

export function isFileObject(file: File): file is FileObject {
    return file != null && typeof file !== "string";
}

export function getFileRelPath(file: File) {
    if (isFileObject(file)) {
        return file.relPath;
    } else {
        return null;
    }
}

export function getFileUrl(file: File) {
    if (file != null) {
        if (isFileObject(file)) {
            return file.absoluteUrl;
        } else {
            return file;
        }
    } else {
        return null;
    }
}
