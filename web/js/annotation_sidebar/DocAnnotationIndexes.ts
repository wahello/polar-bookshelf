import {DocAnnotationIndex} from './DocAnnotationIndex';
import {DocAnnotation, SortedDocAnnotations} from './DocAnnotation';

export class DocAnnotationIndexes {

    public static delete(docAnnotationIndex: DocAnnotationIndex,
                         ...ids: string[]): DocAnnotationIndex {

        const docAnnotationMap = Object.assign({}, docAnnotationIndex.docAnnotationMap);

        for (const id of ids) {
            delete docAnnotationMap[id];
        }

        const tmpIndex = new DocAnnotationIndex(docAnnotationMap, Object.values(docAnnotationMap));
        return this.rebuild(tmpIndex);

    }

    public static rebuild(docAnnotationIndex: DocAnnotationIndex,
                          ...docAnnotations: DocAnnotation[]): DocAnnotationIndex {

        const docAnnotationMap = Object.assign({}, docAnnotationIndex.docAnnotationMap);
        const sortedDocAnnotations: SortedDocAnnotations = [];

        const result = new DocAnnotationIndex(docAnnotationMap, sortedDocAnnotations);

        for (const docAnnotation of docAnnotations) {
            docAnnotationMap[docAnnotation.id] = docAnnotation;
        }

        sortedDocAnnotations.push(...Object.values(docAnnotationMap));

        function sortScore(item: DocAnnotation) {
            return item.pageNum * item.position.x * item.position.y;
        }

        // now sort the doc annotations so that they're in the order we need them.
        sortedDocAnnotations.sort((a, b) => sortScore(a) - sortScore(b));

        return result;

    }

}
