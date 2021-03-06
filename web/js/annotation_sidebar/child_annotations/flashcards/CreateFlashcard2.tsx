import * as React from 'react';
import {useCallback} from 'react';
import {CancelButton} from "../CancelButton";
import {FlashcardInput} from './flashcard_input/FlashcardInput';
import {ScrollIntoView} from '../../../ui/ScrollIntoView';
import {useAnnotationActiveInputContext} from "../../AnnotationActiveInputContext";
import {
    IFlashcardCreate,
    useAnnotationMutationsContext
} from "../../AnnotationMutationsContext";
import {FlashcardInputFieldsType} from "./flashcard_input/FlashcardInputs";
import {FlashcardType} from "polar-shared/src/metadata/FlashcardType";
import {IDocAnnotationRef} from "../../DocAnnotation";
import {Refs} from "polar-shared/src/metadata/Refs";

interface IProps {

    readonly id?: string;

    readonly defaultValue?: string;

    // FIXME: I don't think this needs to be passed any more.
    readonly parent: IDocAnnotationRef;

}

export const CreateFlashcard2 = (props: IProps) => {

    const annotationInputContext = useAnnotationActiveInputContext();
    const annotationMutations = useAnnotationMutationsContext();

    const onFlashcard = useCallback((flashcardType: FlashcardType,
                                     fields: Readonly<FlashcardInputFieldsType>) => {

        annotationInputContext.reset();

        const mutation: IFlashcardCreate = {
            selected: [props.parent],
            type: 'create',
            flashcardType,
            fields,
            parent: Refs.createRef(props.parent)
        };

        annotationMutations.onFlashcard(mutation);

    }, []);

    if (annotationInputContext.active !== 'flashcard') {
        return null;
    }

    const cancelButton = <CancelButton onClick={annotationInputContext.reset}/>;

    return (

        <ScrollIntoView>
            <FlashcardInput id={'edit-flashcard-for' + props.id}
                            onFlashcard={onFlashcard}
                            defaultValue={props.defaultValue}
                            cancelButton={cancelButton}/>
        </ScrollIntoView>

    );

};


