def test_get_analysis_s3_url_with_s3():
    from update_event import get_s3_url
    s3_url = "https://textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj.s3.eu-west-1.amazonaws.com/tenders/tender%23fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221.pdf"
    new_s3_url = get_s3_url(s3_url, ".txt")
    assert new_s3_url == "https://textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj.s3.eu-west-1.amazonaws.com/tenders/tender%23fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221/A460572221.txt"

def test_get_s3_url_successive_calls():
    from update_event import get_s3_url
    s3_url = "https://textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj.s3.eu-west-1.amazonaws.com/tenders/tender%23fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221.pdf"
    txt_s3_url = get_s3_url(s3_url, ".txt")
    assert txt_s3_url == "https://textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj.s3.eu-west-1.amazonaws.com/tenders/tender%23fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221/A460572221.txt"
    json_s3_url = get_s3_url(txt_s3_url, ".json")
    assert json_s3_url == "https://textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj.s3.eu-west-1.amazonaws.com/tenders/tender%23fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221/A460572221.json"

def test_get_s3_object_url():
    from update_event import get_s3_object_url
    object_name = "tenders/tender#fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221.pdf"
    new_object_name = get_s3_object_url(object_name, ".txt")
    assert new_object_name == "tenders/tender#fc6e606a-c4ac-431f-baa1-a23b3815adbb/A460572221/A460572221.txt"